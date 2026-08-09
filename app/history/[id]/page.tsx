import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function WorkoutDetail({
  params,
}: PageProps<"/history/[id]">) {
  const { id } = await params;

  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .select("id, date, workout_type, status, notes")
    .eq("id", id)
    .maybeSingle();

  if (workoutError) {
    throw new Error(
      `Failed to read workout from Supabase: ${workoutError.message} (code: ${workoutError.code})`
    );
  }

  if (!workout) {
    notFound();
  }

  const { data: exercises, error: exercisesError } = await supabase
    .from("exercises")
    .select("id, exercise_name, weight, sets, reps")
    .eq("workout_id", id);

  if (exercisesError) {
    throw new Error(
      `Failed to read exercises from Supabase: ${exercisesError.message} (code: ${exercisesError.code})`
    );
  }

  return (
    <div className="screen">
      <h2>Workout Detail</h2>

      <section className="card">
        <p>
          Date: <strong>{workout.date}</strong>
        </p>
        <p>
          Workout Type: <strong>{workout.workout_type}</strong>
        </p>
        <p>
          Status: <strong>{workout.status}</strong>
        </p>
      </section>

      <section className="card">
        <h3>Exercises</h3>
        {exercises.length === 0 ? (
          <p className="placeholder-note">No exercises logged.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Exercise</th>
                <th>Weight</th>
                <th>Sets</th>
                <th>Reps</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((exercise) => (
                <tr key={exercise.id}>
                  <td>{exercise.exercise_name}</td>
                  <td>{exercise.weight ?? "—"}</td>
                  <td>{exercise.sets ?? "—"}</td>
                  <td>{exercise.reps ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card">
        <h3>Workout Notes</h3>
        <p>{workout.notes || "—"}</p>
      </section>

      <Link href="/history" className="button-link secondary">
        Back to Workout History
      </Link>
    </div>
  );
}
