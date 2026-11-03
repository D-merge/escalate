import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dumbbell, TrendingUp, History as HistoryIcon, User } from "lucide-react";
import { C } from "./theme.js";
import { iso, addDays } from "./dates.js";
import { LIBRARY } from "./program.js";
import {
  emptyState, uid, planFor, buildWorkout, completeSession, skipSession, streakInfo,
  prescribeExercise, slotFromLib, lastSummary, countable, lastBackupDays,
} from "./engine.js";
import { loadState, saveState, requestPersistence, downloadBackup, parseBackup } from "./db.js";
import { randomQuote } from "./quotes.js";
import { SkipSheet, Picker, RestTimer } from "./ui.jsx";
import Setup from "./Setup.jsx";
import { TrainHome, SwitchSheet, WorkoutScreen, ExerciseScreen, DoneScreen, SkippedScreen } from "./Train.jsx";
import Progress from "./Progress.jsx";
import History from "./History.jsx";
import Profile from "./Profile.jsx";
import Manual from "./Manual.jsx";

const TABS = [
  { id: "train", label: "Train", Icon: Dumbbell },
  { id: "progress", label: "Progress", Icon: TrendingUp },
  { id: "history", label: "History", Icon: HistoryIcon },
  { id: "profile", label: "Profile", Icon: User },
];

export default function App() {
  const [state, setState] = useState(null); // null = still loading
  const [tab, setTab] = useState("train");
  const [view, setView] = useState({ name: "home" });
  const [skipMeta, setSkipMeta] = useState(null);
  const [skipReason, setSkipReason] = useState("Tired");
  const [sheet, setSheet] = useState(null); // "switch" | {kind:"add"} | {kind:"swap", exId, muscle}
  const [rest, setRest] = useState(null);
  const [setupError, setSetupError] = useState("");
  const quote = useMemo(randomQuote, []);
  const stateRef = useRef(null);
  const loaded = useRef(false);
  const timer = useRef(null);

  // ---- load / save ---------------------------------------------------------
  useEffect(() => {
    loadState().then((s) => {
      const st = s || emptyState();
      stateRef.current = st;
      loaded.current = true;
      setState(st);
      if (st.profile.setupDone) requestPersistence();
    });
  }, []);

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    const st = stateRef.current;
    if (loaded.current && st && st.profile.setupDone) saveState(st).catch(() => {});
  }, []);

  useEffect(() => {
    const onHide = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
    };
  }, [flush]);

  const replace = useCallback((next) => {
    stateRef.current = next;
    setState(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, 400);
  }, [flush]);

  const update = useCallback((fn) => replace(fn(stateRef.current)), [replace]);

  // ---- setup / restore -----------------------------------------------------
  const finishSetup = ({ name, age, weight, lifts }) => {
    const today = iso();
    const base = emptyState();
    const exercises = [];
    Object.entries(lifts).forEach(([n, v]) => {
      const l = LIBRARY.find((x) => x.name === n);
      const reps = Number(v.r), w = Number(v.w) || 0;
      if (!l || !(reps > 0)) return;
      if (l.unit !== "bw" && !(w > 0)) return;
      exercises.push({ name: n, muscle: l.muscle, unit: l.unit, targetReps: reps, sets: [{ type: "work", reps, weight: w }] });
    });
    const sessions = exercises.length
      ? [{ id: uid(), ts: Date.now(), date: addDays(today, -1), name: "Starting lifts", type: "baseline", templateKey: null, status: "done", mins: 0, exercises }]
      : [];
    const next = {
      ...base,
      profile: { name, age, setupDone: true },
      weightLog: [{ date: today, kg: weight }],
      sessions,
      settings: base.settings,
    };
    replace(next);
    flush();
    requestPersistence();
  };

  const restore = async (text) => {
    try {
      const st = parseBackup(text);
      st.profile.setupDone = true;
      replace(st);
      flush();
      setSetupError("");
      requestPersistence();
    } catch (e) {
      setSetupError(e.message);
    }
  };

  const importText = (text) => {
    try {
      const st = parseBackup(text);
      if (!window.confirm("Replace everything on this phone with the backup? This can't be undone.")) return "";
      st.profile.setupDone = true;
      replace(st);
      flush();
      setView({ name: "home" });
      return "Backup restored.";
    } catch (e) {
      return e.message;
    }
  };

  const exportData = () => {
    downloadBackup(stateRef.current);
    update((s) => ({ ...s, settings: { ...s.settings, lastExport: iso() } }));
  };

  const resetAll = () => {
    if (!window.confirm("Erase ALL workouts and settings on this phone? Export a backup first if you want to keep them.")) return;
    const fresh = emptyState();
    stateRef.current = fresh;
    setState(fresh);
    saveState(fresh).catch(() => {});
    setView({ name: "home" });
    setTab("train");
  };

  if (!state) return <Shell><div style={{ flex: 1 }} /></Shell>;
  if (!state.profile.setupDone) {
    return <Shell><Setup onDone={finishSetup} onRestore={restore} error={setupError} /></Shell>;
  }

  // ---- derived -------------------------------------------------------------
  const today = iso();
  const s = state;
  const active = s.active;
  const todays = s.sessions.filter((x) => x.date === today && x.type !== "baseline");
  const handled = todays.some((x) => x.type !== "manual");
  const doneToday = todays.some((x) => x.status === "done");
  const targetDate = handled ? addDays(today, 1) : today;
  const plan = planFor(s, targetDate);
  const streak = streakInfo(s, today);
  const bd = lastBackupDays(s, today);
  const backupDue = countable(s).length >= 3 && (bd === null || bd > 14);

  // ---- actions -------------------------------------------------------------
  const start = (key) => {
    update((st) => ({ ...st, active: buildWorkout(st, key, iso()) }));
    setSheet(null);
    setView({ name: "workout" });
  };
  const setActive = (fn) => update((st) => (st.active ? { ...st, active: fn(st.active) } : st));
  const updateEx = (ex) => setActive((a) => ({ ...a, exercises: a.exercises.map((e) => (e.id === ex.id ? ex : e)) }));

  const finish = () => {
    const a = stateRef.current.active;
    if (!a) return;
    const mins = Math.max(1, Math.round((Date.now() - a.startedAt) / 60000));
    const res = completeSession(stateRef.current, { ...a, mins });
    replace(res.state);
    flush();
    setRest(null);
    setView({ name: "done", summary: res.summary });
  };

  const saveManual = (draft) => {
    const res = completeSession(stateRef.current, draft);
    replace(res.state);
    flush();
    setView({ name: "done", summary: res.summary });
  };

  const confirmSkip = () => {
    const res = skipSession(stateRef.current, skipMeta, skipReason);
    replace(res.state);
    flush();
    const info = { name: skipMeta.name, reason: skipReason, upNext: res.upNext };
    setSkipMeta(null);
    setRest(null);
    setView({ name: "skipped", info });
  };

  const openSkip = (meta) => { setSkipReason("Tired"); setSkipMeta(meta); };
  const goHome = () => { setView({ name: "home" }); setTab("train"); };

  const pickExercise = (l) => {
    const classReps = s.settings.classReps;
    const ex = prescribeExercise(stateRef.current, slotFromLib(l.name), { classReps });
    if (sheet && sheet.kind === "swap") {
      setActive((a) => ({ ...a, exercises: a.exercises.map((e) => (e.id === sheet.exId ? ex : e)) }));
      setView({ name: "exercise", exId: ex.id });
    } else {
      setActive((a) => ({ ...a, exercises: [...a.exercises, ex] }));
    }
    setSheet(null);
  };

  // ---- screen --------------------------------------------------------------
  const inTabs = view.name === "home" || view.name === "train";
  let body;

  if (view.name === "workout" && active) {
    body = (
      <WorkoutScreen
        active={active}
        onBack={goHome}
        onOpenEx={(id) => setView({ name: "exercise", exId: id })}
        onFinish={finish}
        onSkip={() => openSkip({ name: active.name, type: active.type, templateKey: active.templateKey })}
        onAddEx={() => setSheet({ kind: "add" })}
      />
    );
  } else if (view.name === "exercise" && active && active.exercises.find((e) => e.id === view.exId)) {
    const ex = active.exercises.find((e) => e.id === view.exId);
    body = (
      <ExerciseScreen
        ex={ex}
        last={lastSummary(s, ex.name)}
        restSecs={s.settings.restSecs}
        onBack={() => setView({ name: "workout" })}
        onUpdate={updateEx}
        onSwap={() => setSheet({ kind: "swap", exId: ex.id, muscle: ex.muscle })}
        onRemove={() => {
          setActive((a) => ({ ...a, exercises: a.exercises.filter((e) => e.id !== ex.id) }));
          setView({ name: "workout" });
        }}
        onSetDone={() => setRest(Date.now() + s.settings.restSecs * 1000)}
      />
    );
  } else if (view.name === "done") {
    body = <DoneScreen summary={view.summary} onClose={goHome} />;
  } else if (view.name === "skipped") {
    body = <SkippedScreen info={view.info} onClose={goHome} />;
  } else if (view.name === "manual") {
    body = <Manual state={s} onBack={() => setView({ name: "home" })} onSave={saveManual} />;
  } else if (tab === "progress") {
    body = <Progress state={s} update={update} />;
  } else if (tab === "history") {
    body = <History state={s} update={update} onManual={() => setView({ name: "manual" })} />;
  } else if (tab === "profile") {
    body = <Profile state={s} update={update} onExport={exportData} onImportText={importText} onReset={resetAll} />;
  } else {
    body = (
      <TrainHome
        plan={plan} handled={handled} doneToday={doneToday} targetDate={targetDate} quote={quote}
        active={active} streak={streak} backupDue={backupDue}
        onStart={start}
        onResume={() => setView({ name: "workout" })}
        onSkip={openSkip}
        onManual={() => setView({ name: "manual" })}
        onSwitch={() => setSheet("switch")}
        onBackup={exportData}
      />
    );
  }

  const showTabs = view.name === "home";

  return (
    <Shell>
      {body}
      {rest && (view.name === "exercise" || view.name === "workout") && <RestTimer until={rest} onClose={() => setRest(null)} />}
      {showTabs && (
        <div style={{ display: "flex", borderTop: "1px solid " + C.soft, background: C.night, paddingBottom: "env(safe-area-inset-bottom)", flexShrink: 0 }}>
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, background: "none", border: "none", padding: "10px 0 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: tab === id ? C.pink : C.muted, fontSize: 11, fontWeight: 600 }}>
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>
      )}
      {skipMeta && <SkipSheet name={skipMeta.name} reason={skipReason} setReason={setSkipReason} onCancel={() => setSkipMeta(null)} onConfirm={confirmSkip} />}
      {sheet === "switch" && <SwitchSheet onPick={start} onClose={() => setSheet(null)} />}
      {sheet && sheet.kind === "add" && <Picker title="Add exercise" onPick={pickExercise} onClose={() => setSheet(null)} />}
      {sheet && sheet.kind === "swap" && <Picker title="Swap exercise" prefer={sheet.muscle} onPick={pickExercise} onClose={() => setSheet(null)} />}
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div style={{ background: C.night, minHeight: "100dvh", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 480, height: "100dvh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", background: C.night, color: C.text, paddingTop: "env(safe-area-inset-top)", fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
        {children}
      </div>
    </div>
  );
}
