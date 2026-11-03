// ---------------------------------------------------------------------------
// ENGINE — the rules that decide what you do next. No AI, just plain maths.
// Pure functions: state in, answer out. Tweak the numbers here if you want
// the app to progress you faster or slower.
// ---------------------------------------------------------------------------

import { iso, addDays, dow, diffDays, fmt, parse, weekStart, endOfMonthsAgo, monthLabel } from "./dates.js";
import {
  LIBRARY, TEMPLATES, CLASS_ROTATION, FREE_ROTATION, DEFAULT_GOALS, LEVELS, MUSCLES, CORE_MUSCLES,
} from "./program.js";

export const uid = () => Math.random().toString(36).slice(2, 10);
const num = (x) => Number(x) || 0;
const r2 = (x) => Math.round(x * 100) / 100;
export const roundTo = (x, step = 2.5) => r2(Math.round(x / step) * step);

// Estimated one-rep max (Epley). Reps are capped at 12 because the formula
// over-estimates on high-rep sets.
export const e1rm = (w, r) => {
  const reps = Math.min(num(r), 12);
  if (reps <= 0 || w <= 0) return 0;
  return reps === 1 ? w : w * (1 + reps / 30);
};

export const lib = (name) => LIBRARY.find((l) => l.name === name);

export const emptyState = () => ({
  version: 1,
  profile: { name: "", age: "", setupDone: false },
  weightLog: [], // [{ date, kg }]
  goals: DEFAULT_GOALS.map((g) => ({ ...g })),
  sessions: [], // see completeSession / skipSession / baseline in App
  active: null, // workout in progress (survives closing the app)
  settings: {
    weeklyGoal: 6,
    classDays: [2, 4], // Tue, Thu
    classIndex: 0, // which class lift is next (index into CLASS_ROTATION)
    classReps: 6, // this fortnight's class rep scheme: 10, 6 or 3
    restSecs: 120,
    lastExport: null,
  },
});

// ----- session helpers ------------------------------------------------------

const doneAll = (state) => state.sessions.filter((s) => s.status === "done"); // includes the starting-lifts baseline
export const countable = (state) => state.sessions.filter((s) => s.status === "done" && s.type !== "baseline");
const workSets = (ex) => ex.sets.filter((t) => t.type === "work");

export function entries(state, name, sinceDate = null) {
  return doneAll(state)
    .filter((s) => !sinceDate || s.date >= sinceDate)
    .sort((a, b) => (a.date !== b.date ? (a.date < b.date ? 1 : -1) : (b.ts || 0) - (a.ts || 0)))
    .map((s) => ({ date: s.date, ex: (s.exercises || []).find((e) => e.name === name) }))
    .filter((x) => x.ex && workSets(x.ex).length > 0);
}
export const lastEntry = (state, name) => entries(state, name)[0] || null;

export const unitLabel = (unit) =>
  ({ kg: "kg", "kg per DB": "kg per DB", bw: "bodyweight (+kg)", secs: "seconds" }[unit] || "kg");

export function setText(unit, t) {
  if (unit === "secs") return `${num(t.reps)}s`;
  if (unit === "bw") return num(t.weight) ? `${num(t.reps)} (+${num(t.weight)}kg)` : `${num(t.reps)}`;
  return `${num(t.weight)}×${num(t.reps)}`;
}

export function lastSummary(state, name) {
  const last = lastEntry(state, name);
  if (!last) return null;
  const unit = (lib(name) || {}).unit || "kg";
  return `${fmt(last.date)}: ${workSets(last.ex).map((t) => setText(unit, t)).join(", ")}`;
}

export function volumeOf(session) {
  let v = 0;
  (session.exercises || []).forEach((e) => {
    if (e.unit === "secs") return;
    const mult = e.unit === "kg per DB" ? 2 : 1;
    workSets(e).forEach((t) => { v += num(t.weight) * num(t.reps) * mult; });
  });
  return Math.round(v);
}

// ----- prescription ---------------------------------------------------------

const mkSet = (type, reps, weight, extra = {}) => ({ id: uid(), type, reps, weight, done: false, ...extra });

export function slotFromLib(name) {
  const m = lib(name) || {};
  return { name, sets: 3, reps: m.unit === "secs" ? 60 : 10, start: m.start ?? 0 };
}

export function prescribeExercise(state, slot, opts = {}) {
  const meta = lib(slot.name) || { muscle: "Other", unit: "kg", step: 2.5, start: 0 };
  const { unit, step } = meta;
  const nSets = slot.sets || 3;
  const last = lastEntry(state, slot.name);
  const lastWork = last ? workSets(last.ex) : [];
  const lastW = lastWork.length ? Math.max(...lastWork.map((t) => num(t.weight))) : null;
  const lastTarget = last ? num(last.ex.targetReps) : 0;

  let reps = slot.reps || 10;
  let weight = slot.start ?? meta.start ?? 0;
  let note = last ? "" : "First time — starting weight is a guess, adjust to suit.";
  const sets = [];

  if (unit === "bw") {
    // Bodyweight reps (chin ups etc.)
    const recent = entries(state, slot.name, addDays(iso(), -60));
    const bestReps = Math.max(0, ...recent.flatMap((e) => workSets(e.ex).map((t) => num(t.reps))));
    weight = lastW || 0;
    if (slot.maxBased) {
      if (bestReps) {
        reps = Math.max(3, Math.round(bestReps * 0.8));
        note = `Sets of ${reps} (about 80% of your recent best, ${bestReps}).` + (slot.amrapLast ? " Last set: go to failure." : "");
      } else {
        note = "No history yet — start with a manageable number." + (slot.amrapLast ? " Last set: go to failure." : "");
      }
      for (let i = 0; i < nSets; i++) {
        const isMax = slot.amrapLast && i === nSets - 1;
        sets.push(mkSet("work", isMax ? Math.max(bestReps, reps) : reps, weight, isMax ? { amrap: true } : {}));
      }
    } else {
      reps = lastTarget || reps;
      if (last) {
        const allHit = lastWork.every((t) => num(t.reps) >= reps);
        if (allHit) { reps += 1; note = "Hit every rep last time → one more rep per set."; }
        else note = "Not every set reached target last time → repeat.";
      }
      for (let i = 0; i < nSets; i++) sets.push(mkSet("work", reps, weight));
    }
  } else if (unit === "secs") {
    reps = lastTarget || reps;
    if (last) {
      const allHit = lastWork.every((t) => num(t.reps) >= reps);
      if (allHit) { reps += 5; note = "Held every set last time → +5 seconds."; }
      else note = "Repeat last time's target.";
    }
    for (let i = 0; i < nSets; i++) sets.push(mkSet("work", reps, 0));
  } else if (slot.role === "main") {
    // Class lift: rep scheme comes from settings (10 / 6 / 3), always 3 sets.
    const target = opts.classReps || 6;
    reps = target;
    if (last && lastTarget === target) {
      const allHit = lastWork.every((t) => num(t.reps) >= target);
      const avg = lastWork.reduce((a, t) => a + num(t.reps), 0) / lastWork.length;
      if (allHit) { weight = r2(lastW + step); note = `Hit all ${target}-rep sets at ${lastW}kg last time → +${step}kg.`; }
      else if (avg < target * 0.8) { weight = roundTo(lastW * 0.95, step); note = "Reps fell well short last time → easing back about 5%."; }
      else { weight = lastW; note = `Not every set reached ${target} reps at ${lastW}kg → repeat it.`; }
    } else if (last) {
      // New rep scheme (or first class session): estimate from your best recent set.
      const recent = entries(state, slot.name, addDays(iso(), -56));
      const pool = recent.length ? recent : [last];
      let best = 0, bestSet = null;
      pool.forEach((e) => workSets(e.ex).forEach((t) => {
        const v = e1rm(num(t.weight), num(t.reps));
        if (v > best) { best = v; bestSet = t; }
      }));
      if (best > 0) {
        weight = roundTo((best / (1 + target / 30)) * 0.95, step);
        // If you've already lifted a weight for at least this many reps, never suggest less.
        if (num(bestSet.reps) >= target) weight = Math.max(weight, num(bestSet.weight));
        note = `Worked out from your best recent set (${num(bestSet.weight)}kg × ${num(bestSet.reps)}) for ${target} reps.`;
      }
    }
    if (weight >= 30) sets.push(mkSet("warmup", 8, roundTo(weight * 0.5, step)));
    for (let i = 0; i < 3; i++) sets.push(mkSet("work", reps, weight));
  } else {
    // Accessories: add weight once every set hits the target reps.
    if (last) {
      reps = lastTarget || reps;
      const allHit = lastWork.every((t) => num(t.reps) >= reps);
      const avg = lastWork.reduce((a, t) => a + num(t.reps), 0) / lastWork.length;
      if (allHit) { weight = r2(lastW + step); note = `Hit ${reps} reps on every set at ${lastW}kg → +${step}kg.`; }
      else if (avg < reps * 0.8) { weight = roundTo(lastW * 0.95, step); note = "Reps fell well short last time → easing back about 5%."; }
      else { weight = lastW; note = `Not every set reached ${reps} reps at ${lastW}kg → repeat it.`; }
    }
    for (let i = 0; i < nSets; i++) sets.push(mkSet("work", reps, weight));
  }

  return { id: uid(), name: slot.name, muscle: meta.muscle, unit, targetReps: reps, note, sets };
}

export function buildWorkout(state, key, date = iso()) {
  const t = TEMPLATES[key];
  return {
    templateKey: key,
    name: t.name,
    type: t.class ? "class" : "free",
    date,
    startedAt: Date.now(),
    exercises: t.slots.map((slot) => prescribeExercise(state, slot, { classReps: state.settings.classReps })),
  };
}

export const templateSetCount = (key) =>
  TEMPLATES[key].slots.reduce((n, s) => n + (s.role === "main" ? 3 : s.sets || 3), 0);

// ----- planning: what's next, or is it a rest day ---------------------------

// Muscles that need recovery time between sessions. Core, calves, glutes and
// shoulders (mostly lateral / rear-delt work here) don't block a workout.
const RECOVERY_MUSCLES = ["Chest", "Back", "Quads", "Hamstrings", "Biceps", "Triceps"];

const templateMuscles = (key) => {
  const set = new Set();
  TEMPLATES[key].slots.forEach((sl) => {
    const m = (lib(sl.name) || {}).muscle;
    if (RECOVERY_MUSCLES.includes(m)) set.add(m);
  });
  return [...set];
};

// Most recent date each muscle was trained (done sessions, including manual logs), up to `date`.
function lastTrained(state, date) {
  const last = {};
  state.sessions.forEach((s) => {
    if (s.status !== "done" || s.type === "baseline" || s.date > date) return;
    (s.exercises || []).forEach((e) => {
      if (RECOVERY_MUSCLES.includes(e.muscle) && (!last[e.muscle] || s.date > last[e.muscle])) last[e.muscle] = s.date;
    });
  });
  return last;
}

// Pick the free session whose muscles have had the most rest. Anything that
// works a muscle trained yesterday (or today) is avoided while another option
// has had at least a day off; ties go to the session done least recently.
function pickFree(state, date) {
  const lastDone = {};
  state.sessions.forEach((s) => {
    if (s.templateKey && (!lastDone[s.templateKey] || s.date > lastDone[s.templateKey])) lastDone[s.templateKey] = s.date;
  });
  const trained = lastTrained(state, date);
  const rested = (key) => {
    const days = templateMuscles(key).map((m) => (trained[m] ? diffDays(date, trained[m]) : 99));
    return days.length ? Math.min(...days) : 99;
  };
  const ranked = FREE_ROTATION.map((k, i) => ({ k, i, rest: rested(k), d: lastDone[k] || "" }));
  const ok = ranked.filter((r) => r.rest >= 2);
  const pool = ok.length ? ok : ranked.filter((r) => r.rest === Math.max(...ranked.map((x) => x.rest)));
  pool.sort((x, y) => (x.d < y.d ? -1 : x.d > y.d ? 1 : x.i - y.i));
  return pool[0].k;
}

export function planFor(state, date) {
  const st = state.settings;
  const done = countable(state);
  const trained = (d) => done.some((x) => x.date === d);
  const wk = weekStart(date);
  const weekCount = done.filter((x) => x.date >= wk && x.date < date).length;
  const freeKey = pickFree(state, date);

  if ([1, 2, 3].every((k) => trained(addDays(date, -k)))) {
    return { kind: "rest", templateKey: freeKey, name: "Rest day", why: "Three training days in a row — recover." };
  }
  if (weekCount >= Math.max(1, st.weeklyGoal)) {
    return { kind: "rest", templateKey: freeKey, name: "Rest day", why: `${weekCount} sessions already this week — goal hit.` };
  }
  return { kind: "workout", templateKey: freeKey, name: TEMPLATES[freeKey].name, class: false, why: "Free session — your least recent workout" };
}

// The next `n` days of plans, assuming you train every workout day.
export function upcoming(state, startDate, n = 4) {
  let sim = state;
  const out = [];
  for (let i = 0; i < n; i++) {
    const date = addDays(startDate, i);
    const plan = planFor(sim, date);
    out.push({ date, plan });
    if (plan.kind === "workout") {
      sim = { ...sim, sessions: [...sim.sessions, { id: "sim" + i, date, templateKey: plan.templateKey, type: "free", status: "done", exercises: TEMPLATES[plan.templateKey].slots.map((sl) => ({ name: sl.name, muscle: (lib(sl.name) || {}).muscle, sets: [] })) }] };
    }
  }
  return out;
}

// ----- finishing / skipping -------------------------------------------------

function advanceClass(state, key) {
  const i = CLASS_ROTATION.indexOf(key);
  if (i < 0) return state;
  return { ...state, settings: { ...state.settings, classIndex: (i + 1) % CLASS_ROTATION.length } };
}

export function completeSession(state, draft) {
  const today = iso();
  const exercises = draft.exercises
    .map((e) => ({
      name: e.name, muscle: e.muscle, unit: e.unit, targetReps: e.targetReps,
      sets: e.sets
        .filter((x) => x.done)
        .map((x) => ({ type: x.type, reps: num(x.reps), weight: num(x.weight), ...(x.amrap ? { amrap: true } : {}) })),
    }))
    .filter((e) => e.sets.some((x) => x.type === "work"));

  const session = {
    id: uid(), ts: Date.now(), date: draft.date, name: draft.name, type: draft.type,
    templateKey: draft.templateKey || null, status: "done", mins: draft.mins, exercises,
  };
  const before = overallScore(state, today);
  let next = { ...state, sessions: [...state.sessions, session], active: draft.manual ? state.active : null };
  next = advanceClass(next, draft.templateKey);
  const after = overallScore(next, today);
  const info = streakInfo(next, today);
  const plan = planFor(next, addDays(today, 1));
  return {
    state: next,
    summary: {
      name: draft.name, volume: volumeOf(session), thisWeek: info.thisWeek, goal: info.goal,
      delta: after - before,
      upNext: `${fmt(addDays(today, 1))} — ${plan.kind === "rest" ? "Rest day" : plan.name}`,
      manual: !!draft.manual,
    },
  };
}

export function skipSession(state, meta, reason) {
  const today = iso();
  const session = {
    id: uid(), ts: Date.now(), date: today, name: meta.name, type: meta.type,
    templateKey: meta.templateKey || null, status: "skipped", reason, exercises: [],
  };
  let next = { ...state, sessions: [...state.sessions, session], active: null };
  next = advanceClass(next, meta.templateKey);
  const plan = planFor(next, addDays(today, 1));
  return { state: next, upNext: `${fmt(addDays(today, 1))} — ${plan.kind === "rest" ? "Rest day" : plan.name}` };
}

// ----- strength score -------------------------------------------------------
// This app's own formula (not Gravl's): for each exercise with a standard,
// score = 100 × (estimated 1RM ÷ bodyweight) ÷ standard. 100 ≈ intermediate.
// Each muscle takes its best exercise over the last 90 days; the overall
// score is the average of the muscles you've trained.

export function bodyweightAt(state, asOf) {
  const log = [...state.weightLog].sort((a, b) => (a.date < b.date ? -1 : 1));
  let bw = null;
  log.forEach((w) => { if (w.date <= asOf) bw = num(w.kg); });
  if (bw == null && log.length) bw = num(log[0].kg);
  return bw > 0 ? bw : 80;
}

export function muscleScores(state, asOf = iso(), windowDays = 90) {
  const from = addDays(asOf, -windowDays);
  const bw = bodyweightAt(state, asOf);
  const best = {};
  doneAll(state).forEach((s) => {
    if (s.date > asOf || s.date < from) return;
    (s.exercises || []).forEach((ex) => {
      const m = lib(ex.name);
      if (!m || !m.std) return;
      workSets(ex).forEach((t) => {
        const reps = num(t.reps), w = num(t.weight);
        const total = m.unit === "bw" ? bw + w : m.unit === "kg per DB" ? w * 2 : w;
        if (reps <= 0 || total <= 0) return;
        const sc = (100 * (e1rm(total, reps) / bw)) / m.std;
        best[m.muscle] = Math.max(best[m.muscle] || 0, sc);
      });
    });
  });
  return MUSCLES.filter((m) => best[m]).map((m) => ({ name: m, score: Math.round(best[m]) }));
}

// Overall score averages the big five (arms are shown in the breakdown but don't
// move the overall number, so training a new muscle never makes it dip).
export const overallFrom = (list) => {
  const core = list.filter((m) => CORE_MUSCLES.includes(m.name));
  return core.length ? Math.round(core.reduce((a, b) => a + b.score, 0) / core.length) : 0;
};
export const overallScore = (state, asOf = iso()) => overallFrom(muscleScores(state, asOf));

export function levelFor(score) {
  let idx = 0;
  LEVELS.forEach((l, i) => { if (score >= l.min) idx = i; });
  return { level: LEVELS[idx], next: LEVELS[idx + 1] || null };
}

export function scoreHistory(state, today = iso()) {
  const pts = [];
  for (let i = 5; i >= 0; i--) {
    const asOf = endOfMonthsAgo(today, i);
    const list = muscleScores(state, asOf);
    if (list.length) pts.push({ m: monthLabel(asOf), v: overallFrom(list) });
  }
  return pts;
}

// ----- goals ----------------------------------------------------------------

export function goalProgress(state, g, today = iso()) {
  const m = lib(g.exercise);
  const from = addDays(today, -90);
  const sets = [];
  doneAll(state).forEach((s) => {
    if (s.date < from) return;
    (s.exercises || []).forEach((ex) => { if (ex.name === g.exercise) workSets(ex).forEach((t) => sets.push(t)); });
  });
  if (m && m.unit === "bw") {
    const best = Math.max(0, ...sets.map((t) => num(t.reps)));
    return { kind: "reps", current: best, target: g.reps, pct: Math.min(100, Math.round((best / g.reps) * 100)), done: best >= g.reps };
  }
  const best = Math.max(0, ...sets.map((t) => e1rm(num(t.weight), num(t.reps))));
  const current = best > 0 ? Math.round((best / (1 + g.reps / 30)) * 2) / 2 : 0; // est. weight you could do for the goal reps
  return { kind: "kg", current, target: g.weight, pct: Math.min(100, Math.round((current / g.weight) * 100)), done: current >= g.weight };
}

// ----- streaks and activity -------------------------------------------------

export function streakInfo(state, today = iso()) {
  const goal = Math.max(1, num(state.settings.weeklyGoal));
  const counts = {};
  countable(state).forEach((s) => { const w = weekStart(s.date); counts[w] = (counts[w] || 0) + 1; });
  const thisWk = weekStart(today);
  let weeks = 0;
  let w = thisWk;
  if ((counts[w] || 0) >= goal) weeks++;
  w = addDays(w, -7);
  while ((counts[w] || 0) >= goal) { weeks++; w = addDays(w, -7); }
  const month = countable(state).filter((s) => s.date.slice(0, 7) === today.slice(0, 7)).length;
  return { weeks, thisWeek: counts[thisWk] || 0, goal, month };
}

export function activityGrid(state, weeks = 12, today = iso()) {
  const start = addDays(weekStart(today), -7 * (weeks - 1));
  const counts = {};
  countable(state).forEach((s) => { counts[s.date] = (counts[s.date] || 0) + 1; });
  const cols = [];
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(start, w * 7 + d);
      col.push({ date, n: counts[date] || 0, future: date > today });
    }
    cols.push(col);
  }
  return cols;
}

export const lastBackupDays = (state, today = iso()) =>
  state.settings.lastExport ? Math.round((parse(today) - parse(state.settings.lastExport)) / 86400000) : null;
