import React, { useRef, useState } from "react";
import { Minus, Plus, Download, Upload } from "lucide-react";
import { C, pillBtn, fieldStyle, bigBtn } from "./theme.js";
import { iso, fmt } from "./dates.js";
import { bodyweightAt, lastBackupDays } from "./engine.js";
import { Card, Label, Title, Screen } from "./ui.jsx";

function Stepper({ value, onChange, min, max, step = 1, suffix = "" }) {
  const btn = { width: 34, height: 34, borderRadius: 999, background: C.chip, color: C.muted, border: "none", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button style={btn} onClick={() => onChange(Math.max(min, value - step))}><Minus size={14} /></button>
      <span style={{ color: C.cyan, fontFamily: "monospace", fontSize: 18, minWidth: 64, textAlign: "center" }}>{value}{suffix}</span>
      <button style={btn} onClick={() => onChange(Math.min(max, value + step))}><Plus size={14} /></button>
    </div>
  );
}

const Row = ({ label, children, hint }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <span style={{ color: C.text, fontSize: 14 }}>{label}</span>
      {children}
    </div>
    {hint && <p style={{ margin: "4px 0 0", color: C.muted, fontSize: 11 }}>{hint}</p>}
  </div>
);

export default function Profile({ state, update, onExport, onImportText, onReset }) {
  const [weight, setWeight] = useState("");
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);
  const s = state.settings;
  const setS = (patch) => update((st) => ({ ...st, settings: { ...st.settings, ...patch } }));
  const today = iso();
  const bw = bodyweightAt(state, today);
  const days = lastBackupDays(state);
  const recentWeights = [...state.weightLog].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 4);

  const logWeight = () => {
    const kg = Number(weight);
    if (!(kg > 0)) return;
    update((st) => ({ ...st, weightLog: [...st.weightLog.filter((w) => w.date !== today), { date: today, kg }] }));
    setWeight("");
  };

  return (
    <Screen>
      <Title>Profile</Title>

      <Card style={{ marginBottom: 14 }}>
        <Label style={{ marginBottom: 8 }}>About you</Label>
        <input value={state.profile.name} onChange={(e) => update((st) => ({ ...st, profile: { ...st.profile, name: e.target.value } }))} placeholder="Name" style={{ ...fieldStyle, marginBottom: 10 }} />
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <input type="number" inputMode="numeric" value={state.profile.age} onChange={(e) => update((st) => ({ ...st, profile: { ...st.profile, age: e.target.value } }))} placeholder="Age" style={{ ...fieldStyle, flex: 1 }} />
        </div>
        <Label style={{ marginBottom: 6 }}>Bodyweight — now {bw}kg</Label>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="New weight (kg)" style={{ ...fieldStyle, flex: 1 }} />
          <button onClick={logWeight} style={{ ...pillBtn, padding: "0 16px", color: C.pink }}>Log</button>
        </div>
        {recentWeights.length > 0 && (
          <p style={{ margin: "8px 0 0", color: C.muted, fontSize: 12 }}>
            {recentWeights.map((w) => `${fmt(w.date)}: ${w.kg}kg`).join("  ·  ")}
          </p>
        )}
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <Label style={{ marginBottom: 12 }}>Training</Label>
        <Row label="Sessions per week" hint="Your weekly goal. Weeks only count toward your streak when you reach it.">
          <Stepper value={s.weeklyGoal} min={1} max={7} onChange={(v) => setS({ weeklyGoal: v })} />
        </Row>
        <Row label="Rest timer" hint="Starts when you tick a set (works while the app is open).">
          <Stepper value={s.restSecs} min={30} max={300} step={15} suffix="s" onChange={(v) => setS({ restSecs: v })} />
        </Row>
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <Label style={{ marginBottom: 8 }}>Your data</Label>
        <p style={{ margin: "0 0 12px", color: C.muted, fontSize: 12 }}>
          Everything is stored on this phone only. Export a backup now and then — clearing Chrome's site data or uninstalling the app would erase it.
          {days === null ? " You haven't exported yet." : ` Last export: ${days === 0 ? "today" : days + " day" + (days === 1 ? "" : "s") + " ago"}.`}
        </p>
        <button onClick={onExport} style={{ ...bigBtn(true), display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}><Download size={16} /> Export backup</button>
        <button onClick={() => fileRef.current && fileRef.current.click()} style={{ ...bigBtn(false), color: C.text, border: "1px solid " + C.border, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Upload size={16} /> Import backup</button>
        <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files && e.target.files[0];
            if (f) f.text().then((t) => setMsg(onImportText(t) || ""));
            e.target.value = "";
          }} />
        {msg && <p style={{ color: C.pink, fontSize: 12, margin: "8px 0 0" }}>{msg}</p>}
      </Card>

      <button onClick={onReset} style={{ width: "100%", padding: 12, background: "none", border: "none", color: C.muted, fontSize: 12, textDecoration: "underline" }}>Erase all data on this phone</button>
    </Screen>
  );
}
