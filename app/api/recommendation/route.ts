import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { anthropic } from "@/lib/anthropic";

// Claude reasoning + multiple Supabase round trips can run long; give this
// route more headroom than the platform default.
export const maxDuration = 60;

const RECOMMENDATION_SCHEMA = {
  type: "object",
  properties: {
    recommendation: { type: "string", enum: ["follow", "modify", "rest"] },
    suggested_workout: { type: "string" },
    explanation: { type: "string" },
  },
  required: ["recommendation", "suggested_workout", "explanation"],
  additionalProperties: false,
};

const SYSTEM_PROMPT = `You are a training recovery assistant for a single-user workout planner app. Your job is to look at the user's data for today and recommend one of three actions: follow their scheduled workout, modify it to a different workout that is already part of their plan, or take active recovery/rest.

The user's fixed weekly training split is:
- Monday: Chest and Biceps
- Tuesday: Active Rest
- Wednesday: Legs
- Thursday: Active Rest
- Friday: Back and Triceps
- Saturday: Sprint Session
- Sunday: Active Rest

You will receive a JSON object describing: today's day of week and scheduled workout, recent workouts from the last ~14 days (with status completed/skipped/moved), scheduled workouts in that window with no matching entry (missed workouts), current recovery status per muscle group (days since each was last trained), and the user's most recent recovery note.

Weigh all of this together and use your own judgment — do not apply a fixed rule like "always follow the schedule" or "always rest if any muscle group has fewer than N days recovery." Consider whether a missed workout should be made up, whether soreness or fatigue described in the recovery notes should change today's plan, and whether the muscle groups needed for today's scheduled workout are adequately recovered.

Only recommend following the scheduled workout, switching to a different workout that is already part of the user's weekly split, or taking active recovery. Do not invent a new training program or workout type that isn't part of the plan.

You are not a medical professional and this app is not medical guidance. If the recovery notes describe significant pain, a possible injury, or anything beyond normal training soreness, keep the recommendation cautious (favor rest or a light modification), explicitly state that this app is not medical guidance, and suggest the user consult a professional if the issue persists.

Respond with the recommendation and a short 1-3 sentence explanation written directly to the user.`;

type RecentWorkout = { date: string; type: string; status: string };
type MissedWorkout = { date: string; type: string };

function errorResponse(message: string) {
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function POST() {
  try {
    const today = new Date();
    const todayDayName = today.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const todayIso = today.toISOString().slice(0, 10);

    const windowStart = new Date(today);
    windowStart.setDate(windowStart.getDate() - 13);
    const windowStartIso = windowStart.toISOString().slice(0, 10);

    const { data: splitRows, error: splitError } = await supabase
      .from("weekly_split")
      .select("day_of_week, workout_type");

    if (splitError) {
      return errorResponse(
        `Failed to read weekly_split from Supabase: ${splitError.message} (code: ${splitError.code})`
      );
    }

    const scheduleMap = Object.fromEntries(
      splitRows.map((row) => [row.day_of_week, row.workout_type])
    );

    const { data: recentWorkouts, error: recentError } = await supabase
      .from("workouts")
      .select("date, workout_type, status")
      .gte("date", windowStartIso)
      .lte("date", todayIso)
      .order("date", { ascending: true });

    if (recentError) {
      return errorResponse(
        `Failed to read workouts from Supabase: ${recentError.message} (code: ${recentError.code})`
      );
    }

    const recentWorkoutsPayload: RecentWorkout[] = recentWorkouts.map(
      (w) => ({
        date: w.date,
        type: w.workout_type,
        status: w.status,
      })
    );

    const workoutDates = new Set(recentWorkouts.map((w) => w.date));
    const missedWorkouts: MissedWorkout[] = [];
    for (let i = 1; i <= 13; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
      const iso = d.toISOString().slice(0, 10);
      const scheduledType = scheduleMap[dayName];
      if (
        scheduledType &&
        scheduledType !== "Active Rest" &&
        !workoutDates.has(iso)
      ) {
        missedWorkouts.push({ date: iso, type: scheduledType });
      }
    }

    const { data: muscleRows, error: muscleError } = await supabase
      .from("muscle_recovery")
      .select("muscle_group, days_since_trained")
      .order("muscle_group");

    if (muscleError) {
      return errorResponse(
        `Failed to read muscle_recovery from Supabase: ${muscleError.message} (code: ${muscleError.code})`
      );
    }

    const muscleRecovery = Object.fromEntries(
      muscleRows.map((row) => [row.muscle_group, row.days_since_trained])
    );

    const { data: noteRow, error: noteError } = await supabase
      .from("recovery_notes")
      .select("notes")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (noteError) {
      return errorResponse(
        `Failed to read recovery_notes from Supabase: ${noteError.message} (code: ${noteError.code})`
      );
    }

    const payload = {
      today: todayDayName,
      scheduled_workout: scheduleMap[todayDayName] ?? "Not scheduled",
      recent_workouts: recentWorkoutsPayload,
      missed_workouts: missedWorkouts,
      muscle_recovery: muscleRecovery,
      recovery_notes: noteRow?.notes ?? "",
    };

    let message;
    try {
      message = await anthropic.messages.create({
        model: "claude-opus-5",
        max_tokens: 4096,
        thinking: { type: "adaptive" },
        system: SYSTEM_PROMPT,
        output_config: {
          format: { type: "json_schema", schema: RECOMMENDATION_SCHEMA },
        },
        messages: [{ role: "user", content: JSON.stringify(payload) }],
      });
    } catch (err) {
      return errorResponse(
        `Claude API request failed: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }

    if (message.stop_reason === "refusal") {
      return errorResponse(
        "Claude declined to generate a recommendation for this request."
      );
    }

    const textBlock = message.content.find((block) => block.type === "text") as
      | { type: "text"; text: string }
      | undefined;

    if (!textBlock) {
      return errorResponse("Claude did not return a text response.");
    }

    let parsed: {
      recommendation: string;
      suggested_workout: string;
      explanation: string;
    };
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      return errorResponse("Claude returned a response that wasn't valid JSON.");
    }

    const recommendationText = `${parsed.recommendation.toUpperCase()}: ${
      parsed.suggested_workout
    }`;

    const { error: insertError } = await supabase.from("recommendations").insert({
      date: todayIso,
      recommendation_text: recommendationText,
      explanation: parsed.explanation,
    });

    if (insertError) {
      return errorResponse(
        `Recommendation was generated, but failed to save: ${insertError.message} (code: ${insertError.code})`
      );
    }

    return NextResponse.json({
      recommendation: parsed.recommendation,
      suggested_workout: parsed.suggested_workout,
      explanation: parsed.explanation,
    });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Unknown error");
  }
}
