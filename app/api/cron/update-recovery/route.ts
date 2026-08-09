import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { MUSCLE_GROUPS, MUSCLE_GROUPS_BY_WORKOUT_TYPE } from "@/lib/constants";

export const maxDuration = 30;

function errorResponse(message: string) {
  return NextResponse.json({ error: message }, { status: 500 });
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);
  return Math.max(0, Math.round((to - from) / 86_400_000));
}

export async function GET() {
  try {
    // Pull the full completed-workout history rather than trusting the
    // existing muscle_recovery rows. This is what makes recomputation
    // order-independent: if a backdated workout gets logged after a more
    // recent one, taking the max date across all history still lands on
    // the true most-recent session instead of whatever was written last.
    const { data: completedWorkouts, error: workoutsError } = await supabase
      .from("workouts")
      .select("date, workout_type")
      .eq("status", "completed");

    if (workoutsError) {
      return errorResponse(
        `Failed to read workouts from Supabase: ${workoutsError.message} (code: ${workoutsError.code})`
      );
    }

    const todayIso = new Date().toISOString().slice(0, 10);

    const results = MUSCLE_GROUPS.map((muscleGroup) => {
      const trainingDates = completedWorkouts
        .filter((workout) =>
          (MUSCLE_GROUPS_BY_WORKOUT_TYPE[workout.workout_type] ?? []).includes(
            muscleGroup
          )
        )
        .map((workout) => workout.date)
        .sort();

      const lastTrainedDate =
        trainingDates.length > 0
          ? trainingDates[trainingDates.length - 1]
          : null;

      const daysSinceTrained = lastTrainedDate
        ? daysBetween(lastTrainedDate, todayIso)
        : 0;

      return { muscleGroup, lastTrainedDate, daysSinceTrained };
    });

    for (const result of results) {
      const { error: updateError } = await supabase
        .from("muscle_recovery")
        .update({
          last_trained_date: result.lastTrainedDate,
          days_since_trained: result.daysSinceTrained,
        })
        .eq("muscle_group", result.muscleGroup);

      if (updateError) {
        return errorResponse(
          `Failed to update muscle_recovery for ${result.muscleGroup}: ${updateError.message} (code: ${updateError.code})`
        );
      }
    }

    return NextResponse.json({
      success: true,
      updated_at: new Date().toISOString(),
      muscle_recovery: results.map((result) => ({
        muscle_group: result.muscleGroup,
        last_trained_date: result.lastTrainedDate,
        days_since_trained: result.daysSinceTrained,
      })),
    });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Unknown error");
  }
}
