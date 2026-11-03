// ---------------------------------------------------------------------------
// PROGRAM — edit this file to change exercises, workouts and goals.
// ---------------------------------------------------------------------------
//
// unit:  "kg"         barbell / machine, weight in kg
//        "kg per DB"  dumbbell, weight is per dumbbell
//        "bw"         bodyweight reps (weight field = extra kg added, usually 0)
//        "secs"       timed hold, "reps" field = seconds
// step:  how much the weight goes up when you hit all your reps
// start: first-ever suggested weight (only used when there is no history)
// std:   "intermediate" strength standard as a multiple of bodyweight
//        (estimated 1-rep max / bodyweight). Exercises with std count toward
//        the strength score; others are logged but don't score.

export const LIBRARY = [
  { name: "Bench Press", muscle: "Chest", unit: "kg", step: 2.5, start: 40, std: 1.0 },
  { name: "Dumbbell Bench Press", muscle: "Chest", unit: "kg per DB", step: 2, start: 16, std: 0.9 },
  { name: "Incline DB Bench", muscle: "Chest", unit: "kg per DB", step: 2, start: 14, std: 0.8 },
  { name: "Flat Bench Flies", muscle: "Chest", unit: "kg per DB", step: 1, start: 8 },
  { name: "Cable Flies", muscle: "Chest", unit: "kg", step: 2.5, start: 10 },
  { name: "Close-Grip Bench", muscle: "Triceps", unit: "kg", step: 2.5, start: 40 },
  { name: "Landmine Press", muscle: "Shoulders", unit: "kg", step: 2.5, start: 20 },

  { name: "Squat", muscle: "Quads", unit: "kg", step: 2.5, start: 40, std: 1.25 },
  { name: "Front Squat", muscle: "Quads", unit: "kg", step: 2.5, start: 30, std: 1.0 },
  { name: "Seated Leg Press", muscle: "Quads", unit: "kg", step: 2.5, start: 60, std: 2.0 },
  { name: "DB Bulgarian Split Squat", muscle: "Quads", unit: "kg per DB", step: 2, start: 10 },
  { name: "Dumbbell Lunge", muscle: "Quads", unit: "kg per DB", step: 2, start: 10 },
  { name: "Single Leg Squat", muscle: "Quads", unit: "bw", step: 2.5, start: 0 },

  { name: "Deadlift", muscle: "Hamstrings", unit: "kg", step: 2.5, start: 50, std: 1.5 },
  { name: "Romanian Deadlift", muscle: "Hamstrings", unit: "kg", step: 2.5, start: 40, std: 1.25 },
  { name: "Single Leg Deadlift", muscle: "Hamstrings", unit: "kg", step: 2.5, start: 10 },
  { name: "Hamstring Curl", muscle: "Hamstrings", unit: "kg", step: 2.5, start: 20 },
  { name: "Hip Thrust", muscle: "Glutes", unit: "kg", step: 5, start: 40 },

  { name: "Shoulder Press", muscle: "Shoulders", unit: "kg", step: 2.5, start: 30, std: 0.6 },
  { name: "Lateral Raise", muscle: "Shoulders", unit: "kg per DB", step: 1, start: 6 },
  { name: "Rear Delt Fly", muscle: "Shoulders", unit: "kg per DB", step: 1, start: 5 },
  { name: "Face Pull", muscle: "Shoulders", unit: "kg", step: 2.5, start: 15 },

  { name: "Chin Ups", muscle: "Back", unit: "bw", step: 2.5, start: 0, std: 1.4 },
  { name: "Pull Ups", muscle: "Back", unit: "bw", step: 2.5, start: 0, std: 1.4 },
  { name: "Lat Pulldown", muscle: "Back", unit: "kg", step: 2.5, start: 40, std: 0.9 },
  { name: "Seated Row", muscle: "Back", unit: "kg", step: 2.5, start: 40, std: 0.9 },

  { name: "Biceps Curl", muscle: "Biceps", unit: "kg per DB", step: 1, start: 8, std: 0.4 },
  { name: "Triceps Pushdown", muscle: "Triceps", unit: "kg", step: 2.5, start: 20, std: 0.5 },

  { name: "Plank (secs)", muscle: "Core", unit: "secs", step: 5, start: 0 },
  { name: "Hanging Knee Raise", muscle: "Core", unit: "bw", step: 2.5, start: 0 },
  { name: "Side Plank (secs)", muscle: "Core", unit: "secs", step: 5, start: 0 },
  { name: "Cable Crunch", muscle: "Core", unit: "kg", step: 2.5, start: 25 },
  { name: "Dead Bug", muscle: "Core", unit: "bw", step: 2.5, start: 0 },

  { name: "Weighted Calf Raise", muscle: "Calves", unit: "kg", step: 2.5, start: 30 },
  { name: "Seated Calf Raise", muscle: "Calves", unit: "kg", step: 2.5, start: 20 },
];

// Muscles shown in the strength score breakdown, in this order.
export const MUSCLES = ["Chest", "Back", "Shoulders", "Quads", "Hamstrings", "Biceps", "Triceps"];
// These five make up the overall strength score.
export const CORE_MUSCLES = ["Chest", "Back", "Shoulders", "Quads", "Hamstrings"];

// Slot options:
//   role: "main"      class lift — reps come from the "class reps" setting (10 / 6 / 3), always 3 sets
//   maxBased: true    bodyweight lift whose reps are set from your recent best (about 80%)
//   amrapLast: true   last set is "to failure"
export const TEMPLATES = {
  // ---- Class days (rotation order below) ----
  bench: {
    name: "Bench Day", class: true,
    slots: [
      { name: "Bench Press", role: "main", sets: 3, start: 60 },
      { name: "Flat Bench Flies", sets: 3, reps: 12, start: 12 },
      { name: "Incline DB Bench", sets: 3, reps: 10, start: 22.5 },
      { name: "Triceps Pushdown", sets: 3, reps: 12, start: 25 },
      { name: "Plank (secs)", sets: 3, reps: 60, start: 0 },
    ],
  },
  squat: {
    name: "Squat Day", class: true,
    slots: [
      { name: "Squat", role: "main", sets: 3, start: 60 },
      { name: "Seated Leg Press", sets: 3, reps: 10, start: 72.5 },
      { name: "Single Leg Deadlift", sets: 3, reps: 10, start: 15 },
      { name: "Plank (secs)", sets: 3, reps: 60, start: 0 },
    ],
  },
  press: {
    name: "Shoulder Press Day", class: true,
    slots: [
      { name: "Shoulder Press", role: "main", sets: 3, start: 42.5 },
      { name: "Lateral Raise", sets: 3, reps: 12, start: 6 },
      { name: "Rear Delt Fly", sets: 3, reps: 12, start: 6 },
      { name: "Face Pull", sets: 3, reps: 12, start: 20 },
      { name: "Plank (secs)", sets: 3, reps: 60, start: 0 },
    ],
  },
  deadlift: {
    name: "Deadlift Day", class: true,
    slots: [
      { name: "Deadlift", role: "main", sets: 3, start: 60 },
      { name: "Romanian Deadlift", sets: 3, reps: 10, start: 50 },
      { name: "Single Leg Deadlift", sets: 3, reps: 10, start: 15 },
      { name: "Hanging Knee Raise", sets: 3, reps: 10, start: 0 },
    ],
  },

  // ---- Free sessions (the app picks whichever you did least recently) ----
  pull: {
    name: "Pull + Chins", class: false,
    slots: [
      { name: "Chin Ups", maxBased: true, amrapLast: true, sets: 4, reps: 6 },
      { name: "Lat Pulldown", sets: 3, reps: 10, start: 40 },
      { name: "Seated Row", sets: 3, reps: 10, start: 40 },
      { name: "Rear Delt Fly", sets: 3, reps: 12, start: 6 },
      { name: "Biceps Curl", sets: 3, reps: 12, start: 10 },
      { name: "Cable Crunch", sets: 3, reps: 12, start: 25 },
    ],
  },
  legs: {
    name: "Single-Leg Legs", class: false,
    slots: [
      { name: "DB Bulgarian Split Squat", sets: 3, reps: 10, start: 12 },
      { name: "Single Leg Deadlift", sets: 3, reps: 10, start: 15 },
      { name: "Seated Leg Press", sets: 3, reps: 12, start: 72.5 },
      { name: "Hamstring Curl", sets: 3, reps: 12, start: 30 },
      { name: "Weighted Calf Raise", sets: 3, reps: 15, start: 30 },
      { name: "Plank (secs)", sets: 3, reps: 60, start: 0 },
    ],
  },
  push: {
    name: "Push Accessories", class: false,
    slots: [
      { name: "Dumbbell Bench Press", sets: 3, reps: 10, start: 25 },
      { name: "Incline DB Bench", sets: 3, reps: 10, start: 22.5 },
      { name: "Landmine Press", sets: 3, reps: 10, start: 20 },
      { name: "Lateral Raise", sets: 3, reps: 12, start: 6 },
      { name: "Triceps Pushdown", sets: 3, reps: 12, start: 25 },
      { name: "Hanging Knee Raise", sets: 3, reps: 10, start: 0 },
    ],
  },
  chins: {
    name: "Chins + Core", class: false,
    slots: [
      { name: "Chin Ups", maxBased: true, amrapLast: true, sets: 5, reps: 6 },
      { name: "Face Pull", sets: 3, reps: 12, start: 20 },
      { name: "Rear Delt Fly", sets: 3, reps: 12, start: 6 },
      { name: "Biceps Curl", sets: 3, reps: 12, start: 10 },
      { name: "Hanging Knee Raise", sets: 3, reps: 10, start: 0 },
      { name: "Side Plank (secs)", sets: 3, reps: 45, start: 0 },
    ],
  },
};

// Class lifts rotate in this order (one per class day).
export const CLASS_ROTATION = ["bench", "squat", "press", "deadlift"];
export const FREE_ROTATION = ["pull", "legs", "push", "chins"];

export const DEFAULT_GOALS = [
  { id: "g1", exercise: "Bench Press", weight: 75, reps: 10 },
  { id: "g2", exercise: "Squat", weight: 75, reps: 10 },
  { id: "g3", exercise: "Chin Ups", weight: 0, reps: 20 },
  { id: "g4", exercise: "Deadlift", weight: 100, reps: 6 },
];

// Lifts asked for on the first-launch screen (best recent set: weight x reps).
export const BASELINE_LIFTS = [
  { name: "Bench Press", w: 60, r: 10 },
  { name: "Squat", w: 60, r: 10 },
  { name: "Deadlift", w: 60, r: 10 },
  { name: "Shoulder Press", w: 42.5, r: 10 },
  { name: "Chin Ups", w: 0, r: 10 },
];

export const LEVELS = [
  { name: "Rookie", min: 0 },
  { name: "Novice", min: 80 },
  { name: "Pro", min: 120 },
  { name: "Athlete", min: 160 },
  { name: "Elite", min: 200 },
];
