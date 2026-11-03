import React from "react";
import { Flame, Moon, SkipForward, ChevronRight, Timer, Info, Repeat2, Trash2, Plus } from "lucide-react";
import { C, pillBtn, bigBtn, ghostBtn } from "./theme.js";
import { TEMPLATES, FREE_ROTATION, LIBRARY } from "./program.js";
import { fmt } from "./dates.js";
import { templateSetCount, e1rm, unitLabel } from "./engine.js";
import { Sun, Card, Label, Title, BackBtn, Badge, Screen, Sheet, SetRow } from "./ui.jsx";

// ---------------------------------------------------------------- Train home

export function TrainHome({ plan, handled, doneToday, targetDate, quote, active, streak, backupDue, onStart, onResume, onSkip, onManual, onSwitch, onBackup }) {
  const isRest = plan.kind === "rest";
  const tpl = TEMPLATES[plan.templateKey];
  const head = active ? "IN PROGRESS" : handled ? "UP NEXT · " + fmt(targetDate).toUpperCase() : "TODAY";

  return (
    <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
      <Sun />
      <div style={{ margin: "12px 18px 14px", position: "relative", background: "rgba(43,21,80,0.85)", border: "1px solid " + C.pink + "80", borderRadius: 12, padding: "8px 14px" }}>
        <Label style={{ color: C.pink, fontSize: 10, letterSpacing: "0.2em" }}>Gym wisdom</Label>
        <p style={{ margin: "2px 0 0", fontSize: 12, fontStyle: "italic", color: C.text }}>{quote}</p>
      </div>

      <div style={{ padding: "0 18px 24px", position: "relative" }}>
        <Label style={{ margin: "58px 0 8px" }}>This week</Label>
        <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
          {Array.from({ length: streak.goal }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 6, borderRadius: 4, background: i < streak.thisWeek ? `linear-gradient(90deg,${C.cyan},${C.pink})` : C.soft }} />
          ))}
        </div>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: C.muted }}>{streak.thisWeek} of {streak.goal} completed this week</p>

        {backupDue && (
          <button onClick={onBackup} style={{ width: "100%", textAlign: "left", marginBottom: 14, padding: "10px 14px", borderRadius: 12, background: "transparent", border: "1px dashed " + C.orange, color: C.orange, fontSize: 12 }}>
            It's been a while since your last backup — tap to export your data.
          </button>
        )}

        {doneToday && !active && (
          <p style={{ margin: "0 0 10px", color: C.green, fontSize: 13, fontWeight: 600 }}>Today's session is done. Nice work.</p>
        )}
        {handled && !doneToday && !active && (
          <p style={{ margin: "0 0 10px", color: C.muted, fontSize: 13 }}>Today's workout was skipped.</p>
        )}

        <Card style={{ padding: 20, background: "linear-gradient(160deg,#3A1660,#2B1550 60%,#1A0B2E)" }}>
          <span style={{ background: active ? C.orange : C.cyan, color: C.night, fontWeight: 800, fontSize: 11, padding: "5px 12px", borderRadius: 999, letterSpacing: "0.08em" }}>{head}</span>

          {active ? (
            <>
              <h2 style={{ margin: "26px 0 6px", fontSize: 28, fontWeight: 800, fontStyle: "italic", color: C.text }}>{active.name}</h2>
              <p style={{ margin: "0 0 18px", color: C.muted, fontSize: 13 }}>Pick up where you left off — your sets are saved.</p>
              <button onClick={onResume} style={bigBtn(true)}>Resume workout</button>
              <button onClick={() => onSkip({ name: active.name, type: active.type, templateKey: active.templateKey })} style={{ ...ghostBtn, marginTop: 10 }}>
                <SkipForward size={14} /> Skip this workout
              </button>
            </>
          ) : isRest ? (
            <>
              <div style={{ margin: "22px 0 8px", display: "flex", alignItems: "center", gap: 10 }}>
                <Moon size={28} color={C.muted} />
                <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, fontStyle: "italic", color: C.text }}>Rest day</h2>
              </div>
              <p style={{ margin: "0 0 18px", color: C.muted, fontSize: 13 }}>{plan.why}</p>
              <button onClick={() => onStart(plan.templateKey)} style={ghostBtn}>Train anyway ({TEMPLATES[plan.templateKey].name})</button>
            </>
          ) : (
            <>
              <p style={{ margin: "26px 0 4px", color: C.orange, fontWeight: 700, fontSize: 13 }}>FREE SESSION</p>
              <h2 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800, fontStyle: "italic", color: C.text }}>{tpl.name}</h2>
              <p style={{ margin: "0 0 14px", color: C.muted, fontSize: 13 }}>{tpl.slots.length} exercises · about {templateSetCount(plan.templateKey)} sets</p>

              <button onClick={() => onStart(plan.templateKey)} style={bigBtn(true)}>Start workout</button>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button onClick={() => onSkip({ name: tpl.name, type: plan.class ? "class" : "free", templateKey: plan.templateKey })} style={{ ...ghostBtn, flex: 1 }}>
                  <SkipForward size={14} /> Skip
                </button>
                <button onClick={onSwitch} style={{ ...ghostBtn, flex: 1 }}>
                  <Repeat2 size={14} /> Switch
                </button>
              </div>
            </>
          )}
        </Card>

        {!active && (
          <button onClick={onManual} style={{ width: "100%", marginTop: 14, padding: 12, borderRadius: 14, background: "transparent", border: "1px dashed " + C.border, color: C.text, fontSize: 13, fontWeight: 600 }}>
            + Log a workout manually
          </button>
        )}
      </div>
    </div>
  );
}

export function SwitchSheet({ onPick, onClose }) {
  const row = (k) => (
    <button key={k} onClick={() => onPick(k)} style={{ width: "100%", textAlign: "left", background: C.chip, border: "none", borderRadius: 12, padding: "11px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", color: C.text, fontSize: 14 }}>
      {TEMPLATES[k].name}
      <ChevronRight size={16} color={C.muted} />
    </button>
  );
  return (
    <Sheet onClose={onClose}>
      <Label style={{ marginBottom: 8 }}>Sessions</Label>
      {FREE_ROTATION.map(row)}
      <button onClick={onClose} style={{ width: "100%", padding: 10, background: "none", border: "none", color: C.muted, fontSize: 13 }}>Cancel</button>
    </Sheet>
  );
}

// ------------------------------------------------------------ Workout overview

export function WorkoutScreen({ active, onBack, onOpenEx, onFinish, onSkip, onAddEx }) {
  const total = active.exercises.reduce((n, e) => n + e.sets.length, 0);
  const done = active.exercises.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);
  return (
    <Screen>
      <BackBtn onClick={onBack}>Train</BackBtn>
      <Title>{active.name}</Title>
      <div style={{ height: 6, borderRadius: 4, background: C.soft, marginBottom: 6 }}>
        <div style={{ height: "100%", width: (total ? (done / total) * 100 : 0) + "%", borderRadius: 4, background: `linear-gradient(90deg,${C.cyan},${C.pink})` }} />
      </div>
      <p style={{ margin: "0 0 16px", fontSize: 12, color: C.muted }}>{done} / {total} sets logged</p>

      {active.exercises.map((ex) => {
        const d = ex.sets.filter((s) => s.done).length;
        const w = ex.sets.filter((s) => s.type === "work");
        const first = w[0];
        const detail = ex.unit === "secs"
          ? `${w.length} × ${first ? first.reps : 0}s`
          : `${w.length} sets · ${first ? first.reps : 0} reps${ex.unit !== "bw" && first ? " · " + first.weight + "kg" : ""}`;
        return (
          <button key={ex.id} onClick={() => onOpenEx(ex.id)} style={{ width: "100%", textAlign: "left", background: C.card, border: "1px solid " + (d === ex.sets.length && d > 0 ? C.green : C.soft), borderRadius: 14, padding: "12px 14px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: 0, color: C.text, fontWeight: 600, fontSize: 15 }}>{ex.name}</p>
              <p style={{ margin: "3px 0 0", color: C.muted, fontSize: 12, fontFamily: "monospace" }}>{detail} · {d}/{ex.sets.length} done</p>
            </div>
            <ChevronRight size={18} color={C.muted} />
          </button>
        );
      })}

      <button onClick={onAddEx} style={{ width: "100%", marginBottom: 16, padding: 11, borderRadius: 12, background: "transparent", border: "1px dashed " + C.border, color: C.muted, fontSize: 13 }}>+ Add exercise</button>
      <button onClick={onFinish} disabled={done === 0} style={bigBtn(done > 0)}>Finish workout</button>
      <button onClick={onSkip} style={{ ...ghostBtn, marginTop: 10 }}><SkipForward size={14} /> Skip this workout</button>
    </Screen>
  );
}

// -------------------------------------------------------------- One exercise

export function ExerciseScreen({ ex, last, onBack, onUpdate, onSwap, onRemove, onSetDone, restSecs }) {
  const meta = LIBRARY.find((l) => l.name === ex.name) || { step: 2.5 };
  const warm = ex.sets.filter((s) => s.type === "warmup");
  const work = ex.sets.filter((s) => s.type === "work");
  const change = (id, patch) => {
    const prev = ex.sets.find((s) => s.id === id);
    if (patch.done === true && !prev.done) onSetDone();
    onUpdate({ ...ex, sets: ex.sets.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  };
  const addSet = () => {
    const l = work[work.length - 1] || { reps: 10, weight: 0 };
    onUpdate({ ...ex, sets: [...ex.sets, { id: "n" + Date.now(), type: "work", reps: l.reps, weight: l.weight, done: false }] });
  };
  const removeSet = () => {
    if (work.length <= 1) return;
    const lastId = work[work.length - 1].id;
    onUpdate({ ...ex, sets: ex.sets.filter((s) => s.id !== lastId) });
  };
  const best = ex.unit === "kg" ? work.filter((s) => s.done).reduce((m, s) => Math.max(m, e1rm(Number(s.weight) || 0, Number(s.reps) || 0)), 0) : 0;
  const mins = Math.floor(restSecs / 60), secs = restSecs % 60;

  return (
    <Screen>
      <BackBtn onClick={onBack}>Workout</BackBtn>
      <Title style={{ marginBottom: 10 }}>{ex.name}</Title>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ background: C.chip, color: C.text, borderRadius: 999, padding: "6px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><Timer size={13} /> {mins}:{String(secs).padStart(2, "0")} rest</span>
        {best > 0 && <span style={{ background: C.chip, color: C.cyan, borderRadius: 999, padding: "6px 12px", fontSize: 12 }}>est. 1RM {best.toFixed(1)}kg</span>}
        <button onClick={onSwap} style={{ ...pillBtn, display: "flex", alignItems: "center", gap: 5, color: C.text }}><Repeat2 size={13} /> Swap</button>
      </div>

      {(ex.note || last) && (
        <div style={{ background: "rgba(43,21,80,0.8)", border: "1px solid " + C.soft, borderRadius: 12, padding: "10px 12px", marginBottom: 16, display: "flex", gap: 8 }}>
          <Info size={15} color={C.cyan} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.45 }}>
            {ex.note && <div style={{ color: C.text }}>{ex.note}</div>}
            {last && <div style={{ marginTop: ex.note ? 4 : 0 }}>Last time — {last}</div>}
          </div>
        </div>
      )}

      {warm.length > 0 && (
        <>
          <Label style={{ marginBottom: 8 }}>Warmup</Label>
          {warm.map((s, i) => <SetRow key={s.id} s={s} idx={i + 1} unit={ex.unit} step={meta.step} onChange={(p) => change(s.id, p)} />)}
        </>
      )}
      <Label style={{ margin: "14px 0 8px" }}>Effective sets ({unitLabel(ex.unit)})</Label>
      {work.map((s, i) => <SetRow key={s.id} s={s} idx={i + 1} unit={ex.unit} step={meta.step} onChange={(p) => change(s.id, p)} />)}

      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <button onClick={addSet} style={{ flex: 1, padding: 10, borderRadius: 12, background: "transparent", border: "1px dashed " + C.border, color: C.muted, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Plus size={13} /> Add set</button>
        {work.length > 1 && <button onClick={removeSet} style={{ flex: 1, padding: 10, borderRadius: 12, background: "transparent", border: "1px dashed " + C.border, color: C.muted, fontSize: 13 }}>Remove last set</button>}
      </div>
      <button onClick={onRemove} style={{ width: "100%", marginTop: 22, padding: 10, background: "none", border: "none", color: C.muted, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Trash2 size={13} /> Remove exercise from this workout</button>
    </Screen>
  );
}

// ------------------------------------------------------------ Finish screens

export function DoneScreen({ summary, onClose }) {
  const d = summary.delta;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, textAlign: "center" }}>
      <div style={{ width: 70, height: 70, borderRadius: 999, background: `linear-gradient(135deg,${C.pink},${C.orange})`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
        <Flame size={30} color="#fff" />
      </div>
      <Label>Workout logged</Label>
      <p style={{ color: C.text, fontSize: 26, fontWeight: 800, fontStyle: "italic", margin: "6px 0 18px" }}>{summary.name}</p>
      <p style={{ color: C.cyan, fontFamily: "monospace", fontSize: 15, margin: "0 0 4px" }}>{summary.volume.toLocaleString()} kg volume</p>
      <p style={{ color: C.muted, fontSize: 13, margin: "0 0 4px" }}>{summary.thisWeek} of {summary.goal} sessions this week</p>
      <p style={{ color: C.pink, fontSize: 13, margin: "0 0 24px" }}>
        {d > 0 ? "Strength score +" + d : d < 0 ? "Strength score " + d : "Strength score held steady"}
      </p>
      <div style={{ width: "100%", height: 1, background: C.soft, marginBottom: 18 }} />
      <Label>Up next</Label>
      <p style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: "6px 0 24px" }}>{summary.upNext}</p>
      <button onClick={onClose} style={{ ...bigBtn(true), width: "auto", padding: "12px 34px" }}>Done</button>
    </div>
  );
}

export function SkippedScreen({ info, onClose }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, textAlign: "center" }}>
      <div style={{ width: 70, height: 70, borderRadius: 999, background: C.chip, border: "1px solid " + C.border, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
        <SkipForward size={30} color={C.muted} />
      </div>
      <Label>Workout skipped</Label>
      <p style={{ color: C.text, fontSize: 26, fontWeight: 800, fontStyle: "italic", margin: "6px 0 6px" }}>{info.name}</p>
      <p style={{ color: C.muted, fontSize: 13, margin: "0 0 24px" }}>Reason: {info.reason}</p>
      <div style={{ width: "100%", height: 1, background: C.soft, marginBottom: 18 }} />
      <Label>Up next</Label>
      <p style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: "6px 0 24px" }}>{info.upNext}</p>
      <button onClick={onClose} style={{ ...bigBtn(true), width: "auto", padding: "12px 34px" }}>Done</button>
    </div>
  );
}

export { Badge };
