import React, { useRef, useState } from "react";
import { C, fieldStyle, bigBtn, pillBtn } from "./theme.js";
import { BASELINE_LIFTS } from "./program.js";
import { Sun, Label } from "./ui.jsx";

export default function Setup({ onDone, onRestore, error }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [lifts, setLifts] = useState(() => Object.fromEntries(BASELINE_LIFTS.map((b) => [b.name, { w: b.w, r: b.r }])));
  const fileRef = useRef(null);

  const ok = name.trim() !== "" && Number(weight) > 0;
  const setLift = (n, patch) => setLifts((l) => ({ ...l, [n]: { ...l[n], ...patch } }));
  const num = (v) => (v === "" ? "" : Number(v));
  const small = { ...fieldStyle, textAlign: "center", fontFamily: "monospace", color: C.cyan, padding: "8px 4px" };

  return (
    <div style={{ flex: 1, overflowY: "auto", position: "relative", padding: "0 20px 32px" }}>
      <Sun />
      <div style={{ height: 110 }} />
      <h1 style={{ margin: "0 0 4px", fontSize: 30, fontWeight: 800, fontStyle: "italic", position: "relative", background: "linear-gradient(180deg,#fff 10%,#2DE2E6 45%,#FF3EA5 75%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 0 10px rgba(255,62,165,.6))" }}>Escalate</h1>
      <p style={{ margin: "0 0 20px", color: C.muted, fontSize: 13 }}>Your workouts, your numbers — saved only on this phone.</p>

      <button onClick={() => fileRef.current && fileRef.current.click()} style={{ ...pillBtn, width: "100%", padding: 11, marginBottom: 6, fontSize: 13 }}>
        Restore from a backup file
      </button>
      <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) f.text().then(onRestore); e.target.value = ""; }} />
      {error && <p style={{ color: C.pink, fontSize: 12, margin: "6px 0 0" }}>{error}</p>}

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
        <div style={{ flex: 1, height: 1, background: C.soft }} />
        <span style={{ color: C.muted, fontSize: 11, letterSpacing: "0.15em" }}>OR START FRESH</span>
        <div style={{ flex: 1, height: 1, background: C.soft }} />
      </div>

      <Label style={{ marginBottom: 6 }}>Name</Label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={{ ...fieldStyle, marginBottom: 14 }} />

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <Label style={{ marginBottom: 6 }}>Age</Label>
          <input type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Years" style={fieldStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <Label style={{ marginBottom: 6 }}>Weight (kg)</Label>
          <input type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="kg" style={fieldStyle} />
        </div>
      </div>

      <Label style={{ marginBottom: 4 }}>Current lifts (optional)</Label>
      <p style={{ margin: "0 0 10px", color: C.muted, fontSize: 12 }}>
        Your best recent set for each. Sets your starting weights and strength score — change them to match what you can do now.
      </p>
      {BASELINE_LIFTS.map((b) => {
        const bw = b.name === "Chin Ups";
        return (
          <div key={b.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ flex: 1.3, color: C.text, fontSize: 14 }}>{bw ? "Chin ups (max reps)" : b.name}</span>
            {!bw && (
              <>
                <input type="number" inputMode="decimal" value={lifts[b.name].w} onChange={(e) => setLift(b.name, { w: num(e.target.value) })} style={{ ...small, flex: 1 }} />
                <span style={{ color: C.muted, fontSize: 13 }}>kg ×</span>
              </>
            )}
            <input type="number" inputMode="numeric" value={lifts[b.name].r} onChange={(e) => setLift(b.name, { r: num(e.target.value) })} style={{ ...small, flex: 1 }} />
            <span style={{ color: C.muted, fontSize: 13, width: 28 }}>reps</span>
          </div>
        );
      })}

      <div style={{ height: 20 }} />

      <button disabled={!ok} onClick={() => onDone({ name: name.trim(), age, weight: Number(weight), lifts })} style={bigBtn(ok)}>
        Let's go
      </button>
      {!ok && <p style={{ color: C.muted, fontSize: 12, textAlign: "center", margin: "8px 0 0" }}>Add your name and weight to continue.</p>}
    </div>
  );
}
