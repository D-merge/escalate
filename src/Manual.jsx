import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { C, pillBtn, bigBtn, fieldStyle } from "./theme.js";
import { iso, addDays, fmt } from "./dates.js";
import { LIBRARY } from "./program.js";
import { prescribeExercise, slotFromLib, uid } from "./engine.js";
import { Label, Title, BackBtn, Screen, SetRow, Picker } from "./ui.jsx";

export default function Manual({ state, onBack, onSave }) {
  const today = iso();
  const dates = Array.from({ length: 7 }, (_, i) => addDays(today, -i));
  const [name, setName] = useState("Free session");
  const [date, setDate] = useState(today);
  const [mins, setMins] = useState(45);
  const [exercises, setExercises] = useState([]);
  const [picking, setPicking] = useState(false);

  const addEx = (l) => {
    const ex = prescribeExercise(state, slotFromLib(l.name));
    // every set in a manual log counts as done; drop any warm-up the engine added
    setExercises((list) => [...list, { ...ex, sets: ex.sets.filter((s) => s.type === "work").map((s) => ({ ...s, done: true })) }]);
    setPicking(false);
  };
  const changeSet = (exId, setId, patch) =>
    setExercises((list) => list.map((e) => (e.id === exId ? { ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) } : e)));
  const addSet = (exId) =>
    setExercises((list) => list.map((e) => {
      if (e.id !== exId) return e;
      const last = e.sets[e.sets.length - 1];
      return { ...e, sets: [...e.sets, { ...last, id: uid(), amrap: false }] };
    }));
  const removeEx = (exId) => setExercises((list) => list.filter((e) => e.id !== exId));
  const totalSets = exercises.reduce((n, e) => n + e.sets.length, 0);

  return (
    <Screen>
      <BackBtn onClick={onBack}>Back</BackBtn>
      <Title>Log a workout</Title>

      <Label style={{ marginBottom: 6 }}>Workout name</Label>
      <input value={name} onChange={(e) => setName(e.target.value)} style={{ ...fieldStyle, marginBottom: 14 }} />

      <Label style={{ marginBottom: 6 }}>Date</Label>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {dates.map((d) => (
          <button key={d} onClick={() => setDate(d)} style={{ ...pillBtn, background: date === d ? C.pink : C.chip, color: date === d ? C.night : C.muted, borderColor: date === d ? C.pink : C.border }}>{d === today ? "Today" : fmt(d)}</button>
        ))}
      </div>

      <Label style={{ marginBottom: 6 }}>Duration (mins)</Label>
      <input type="number" inputMode="numeric" value={mins} onChange={(e) => setMins(e.target.value)} style={{ ...fieldStyle, width: 110, fontFamily: "monospace", color: C.cyan, marginBottom: 18 }} />

      <Label style={{ marginBottom: 8 }}>Exercises</Label>
      {exercises.map((e) => {
        const meta = LIBRARY.find((l) => l.name === e.name) || { step: 2.5 };
        return (
          <div key={e.id} style={{ background: C.card, border: "1px solid " + C.soft, borderRadius: 14, padding: "10px 10px 6px", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, padding: "0 4px" }}>
              <div>
                <p style={{ margin: 0, color: C.text, fontWeight: 600, fontSize: 15 }}>{e.name}</p>
                <p style={{ margin: "2px 0 0", color: C.muted, fontSize: 11 }}>{e.muscle} · {e.unit}</p>
              </div>
              <button onClick={() => removeEx(e.id)} style={{ background: "none", border: "none", color: C.muted, padding: 4 }}><Trash2 size={16} /></button>
            </div>
            {e.sets.map((x, i) => (
              <SetRow key={x.id} s={x} idx={i + 1} unit={e.unit} step={meta.step} hideDone onChange={(patch) => changeSet(e.id, x.id, patch)} />
            ))}
            <button onClick={() => addSet(e.id)} style={{ width: "100%", margin: "2px 0 6px", padding: 8, borderRadius: 10, background: "transparent", border: "1px dashed " + C.border, color: C.muted, fontSize: 12 }}>+ Add set</button>
          </div>
        );
      })}
      <button onClick={() => setPicking(true)} style={{ width: "100%", padding: 12, borderRadius: 12, background: C.chip, border: "1px solid " + C.border, color: C.text, fontSize: 14, fontWeight: 600, marginBottom: 16 }}>+ Add exercise</button>

      <button
        disabled={exercises.length === 0}
        onClick={() => onSave({ name: name.trim() || "Free session", type: "manual", templateKey: null, date, mins: Number(mins) || 0, exercises, manual: true })}
        style={bigBtn(exercises.length > 0)}
      >
        Save workout{totalSets ? ` (${totalSets} sets)` : ""}
      </button>

      {picking && <Picker onPick={addEx} onClose={() => setPicking(false)} />}
    </Screen>
  );
}
