// Fixed weekly split and muscle groups (mirrors the seed data in
// workout_planner_schema.sql). Used for UI defaults only, until these
// screens are wired up to Supabase.

export const WEEKLY_SPLIT: Record<string, string> = {
  Monday: "Chest and Biceps",
  Tuesday: "Active Rest",
  Wednesday: "Legs",
  Thursday: "Active Rest",
  Friday: "Back and Triceps",
  Saturday: "Sprint Session",
  Sunday: "Active Rest",
};

export const WORKOUT_TYPES = [
  "Chest and Biceps",
  "Active Rest",
  "Legs",
  "Back and Triceps",
  "Sprint Session",
];

export const MUSCLE_GROUPS = ["Chest", "Back", "Legs", "Biceps", "Triceps"];

// Which muscle_recovery rows a given workout type trains. Active Rest and
// Sprint Session aren't tied to any of the tracked muscle groups, so they
// don't update recovery status.
export const MUSCLE_GROUPS_BY_WORKOUT_TYPE: Record<string, string[]> = {
  "Chest and Biceps": ["Chest", "Biceps"],
  "Active Rest": [],
  Legs: ["Legs"],
  "Back and Triceps": ["Back", "Triceps"],
  "Sprint Session": [],
};
