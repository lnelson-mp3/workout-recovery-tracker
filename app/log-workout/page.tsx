"use client";

import Link from "next/link";
import { useState } from "react";
import { WEEKLY_SPLIT, WORKOUT_TYPES } from "@/lib/constants";
import { saveWorkout } from "./actions";

type ExerciseRow = {
  name: string;
  weight: string;
  sets: string;
  reps: string;
};

function emptyRow(): ExerciseRow {
  return { name: "", weight: "", sets: "", reps: "" };
}

export default function LogWorkout() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayIso = new Date().toISOString().slice(0, 10);

  const [workoutType, setWorkoutType] = useState(WEEKLY_SPLIT[today]);
  const [date, setDate] = useState(todayIso);
  const [exercises, setExercises] = useState<ExerciseRow[]>([emptyRow()]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setSaving(true);
    const result = await saveWorkout({ date, workoutType, notes, exercises });
    if (result?.error) {
      setError(result.error);
      setSaving(false);
    }
  }

  function updateExercise(
    index: number,
    field: keyof ExerciseRow,
    value: string
  ) {
    setExercises((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function addExercise() {
    setExercises((rows) => [...rows, emptyRow()]);
  }

  return (
    <div className="screen">
      <h2>Log Workout</h2>

      <section className="card">
        <label>
          Workout Type
          <select
            value={workoutType}
            onChange={(e) => setWorkoutType(e.target.value)}
          >
            {WORKOUT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </section>

      <section className="card">
        <h3>Exercises</h3>
        {exercises.map((row, index) => (
          <div className="exercise-row" key={index}>
            <input
              type="text"
              placeholder="Exercise"
              value={row.name}
              onChange={(e) => updateExercise(index, "name", e.target.value)}
            />
            <input
              type="number"
              placeholder="Weight"
              value={row.weight}
              onChange={(e) =>
                updateExercise(index, "weight", e.target.value)
              }
            />
            <input
              type="number"
              placeholder="Sets"
              value={row.sets}
              onChange={(e) => updateExercise(index, "sets", e.target.value)}
            />
            <input
              type="number"
              placeholder="Reps"
              value={row.reps}
              onChange={(e) => updateExercise(index, "reps", e.target.value)}
            />
          </div>
        ))}
        <button type="button" onClick={addExercise}>
          Add Exercise
        </button>
      </section>

      <section className="card">
        <label>
          Workout Notes
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
      </section>

      {error && <p className="error-message">{error}</p>}

      <div className="actions">
        <Link href="/" className="button-link secondary">
          Cancel
        </Link>
        <button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Workout"}
        </button>
      </div>
    </div>
  );
}
