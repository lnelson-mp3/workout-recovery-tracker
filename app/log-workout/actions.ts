"use server";

import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MUSCLE_GROUPS_BY_WORKOUT_TYPE } from "@/lib/constants";

type ExerciseInput = {
  name: string;
  weight: string;
  sets: string;
  reps: string;
};

type SaveWorkoutInput = {
  date: string;
  workoutType: string;
  notes: string;
  exercises: ExerciseInput[];
};

type SaveWorkoutResult = { error: string };

function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);
  return Math.max(0, Math.round((to - from) / 86_400_000));
}

export async function saveWorkout(
  input: SaveWorkoutInput
): Promise<SaveWorkoutResult | undefined> {
  const { date, workoutType, notes, exercises } = input;

  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .insert({
      date,
      workout_type: workoutType,
      status: "completed",
      notes: notes.trim() === "" ? null : notes,
    })
    .select("id")
    .single();

  if (workoutError || !workout) {
    return {
      error: `Failed to save workout: ${workoutError?.message ?? "unknown error"} (code: ${workoutError?.code ?? "n/a"})`,
    };
  }

  const exerciseRows = exercises
    .filter((row) => row.name.trim() !== "")
    .map((row) => ({
      workout_id: workout.id,
      exercise_name: row.name.trim(),
      weight: row.weight === "" ? null : Number(row.weight),
      sets: row.sets === "" ? null : Number(row.sets),
      reps: row.reps === "" ? null : Number(row.reps),
    }));

  if (exerciseRows.length > 0) {
    const { error: exercisesError } = await supabase
      .from("exercises")
      .insert(exerciseRows);

    if (exercisesError) {
      return {
        error: `Workout was saved, but exercises failed to save: ${exercisesError.message} (code: ${exercisesError.code})`,
      };
    }
  }

  const muscleGroups = MUSCLE_GROUPS_BY_WORKOUT_TYPE[workoutType] ?? [];

  if (muscleGroups.length > 0) {
    const today = new Date().toISOString().slice(0, 10);
    const { error: recoveryError } = await supabase
      .from("muscle_recovery")
      .update({
        last_trained_date: date,
        days_since_trained: daysBetween(date, today),
      })
      .in("muscle_group", muscleGroups);

    if (recoveryError) {
      return {
        error: `Workout and exercises were saved, but recovery status failed to update: ${recoveryError.message} (code: ${recoveryError.code})`,
      };
    }
  }

  redirect("/history");
}
