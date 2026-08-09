import Link from "next/link";
import { supabase } from "@/lib/supabase";
import RecoveryNotes from "@/components/RecoveryNotes";
import Recommendation from "@/components/Recommendation";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayIso = new Date().toISOString().slice(0, 10);

  const { data: splitRow, error: splitError } = await supabase
    .from("weekly_split")
    .select("workout_type")
    .eq("day_of_week", today)
    .maybeSingle();

  if (splitError) {
    throw new Error(
      `Failed to read weekly_split from Supabase: ${splitError.message} (code: ${splitError.code})`
    );
  }

  const { data: muscleRows, error: muscleError } = await supabase
    .from("muscle_recovery")
    .select("muscle_group, days_since_trained")
    .order("muscle_group");

  if (muscleError) {
    throw new Error(
      `Failed to read muscle_recovery from Supabase: ${muscleError.message} (code: ${muscleError.code})`
    );
  }

  const { data: noteRow, error: noteError } = await supabase
    .from("recovery_notes")
    .select("notes")
    .eq("date", todayIso)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (noteError) {
    throw new Error(
      `Failed to read recovery_notes from Supabase: ${noteError.message} (code: ${noteError.code})`
    );
  }

  const scheduledWorkout = splitRow?.workout_type ?? "Not scheduled";

  return (
    <div className="screen">
      <section className="card">
        <p>
          Today: <strong>{today}</strong>
        </p>
        <p>
          Today&apos;s Workout: <strong>{scheduledWorkout}</strong>
        </p>
      </section>

      <section className="card">
        <h2>Recovery Status</h2>
        <ul className="recovery-list">
          {(muscleRows ?? []).map((row) => (
            <li key={row.muscle_group}>
              <span>{row.muscle_group}</span>
              <span>
                {row.days_since_trained === null
                  ? "—"
                  : row.days_since_trained}{" "}
                days
              </span>
            </li>
          ))}
        </ul>
      </section>

      <RecoveryNotes initialNote={noteRow?.notes ?? ""} />

      <Recommendation />

      <Link href="/log-workout" className="button-link">
        Log Workout
      </Link>
    </div>
  );
}
