import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function WorkoutHistory() {
  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("id, date, workout_type, status")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `Failed to read workouts from Supabase: ${error.message} (code: ${error.code})`
    );
  }

  return (
    <div className="screen">
      <h2>Workout History</h2>

      <table className="history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Workout</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {workouts.length === 0 ? (
            <tr>
              <td colSpan={4} className="placeholder-note">
                No workouts logged yet.
              </td>
            </tr>
          ) : (
            workouts.map((workout) => (
              <tr key={workout.id}>
                <td>{workout.date}</td>
                <td>{workout.workout_type}</td>
                <td className="status-cell">{workout.status}</td>
                <td>
                  <Link href={`/history/${workout.id}`}>View Workout</Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
