import React, { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { C, pillBtn } from "./theme.js";
import { fmt } from "./dates.js";
import { volumeOf, setText } from "./engine.js";
import { Card, Label, Badge, Screen } from "./ui.jsx";

export default function History({ state, update, onManual }) {
  const [open, setOpen] = useState(null);
  const [limit, setLimit] = useState(30);

  const list = state.sessions
    .filter((s) => s.type !== "baseline")
    .sort((a, b) => (a.date !== b.date ? (a.date < b.date ? 1 : -1) : (b.ts || 0) - (a.ts || 0)));

  const remove = (id) => {
    if (window.confirm("Delete this workout from your history?")) {
      update((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== id) }));
      setOpen(null);
    }
  };

  return (
    <Screen>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, fontStyle: "italic", color: C.text, margin: 0 }}>Recent workouts</h1>
        <button onClick={onManual} style={{ ...pillBtn, color: C.pink, display: "flex", alignItems: "center", gap: 4 }}><Plus size={13} /> Log</button>
      </div>

      {list.length === 0 && (
        <Card><p style={{ margin: 0, color: C.muted, fontSize: 13 }}>No workouts yet. Finish one on the Train tab, or tap Log to add one by hand.</p></Card>
      )}

      {list.slice(0, limit).map((r) => {
        const skipped = r.status === "skipped";
        const expanded = open === r.id;
        return (
          <Card key={r.id} style={{ marginBottom: 12, opacity: skipped ? 0.8 : 1, borderStyle: skipped ? "dashed" : "solid", padding: 14 }}>
            <button onClick={() => !skipped && setOpen(expanded ? null : r.id)} style={{ width: "100%", background: "none", border: "none", padding: 0, textAlign: "left", cursor: skipped ? "default" : "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Label>{fmt(r.date)}</Label>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {skipped && <Badge text="SKIPPED" color={C.orange} />}
                  {r.type === "manual" && <Badge text="MANUAL" color={C.cyan} />}
                  {!skipped && (expanded ? <ChevronUp size={16} color={C.muted} /> : <ChevronDown size={16} color={C.muted} />)}
                </div>
              </div>
              <p style={{ margin: "4px 0 4px", color: skipped ? C.muted : C.text, fontSize: 18, fontWeight: 800, fontStyle: "italic" }}>{r.name}</p>
              {skipped ? (
                <p style={{ margin: 0, color: C.muted, fontSize: 12 }}>Reason: {r.reason}</p>
              ) : (
                <>
                  <p style={{ margin: "0 0 10px", color: C.muted, fontSize: 12 }}>{(r.exercises || []).slice(0, 3).map((e) => e.name).join(", ")}{(r.exercises || []).length > 3 ? ` +${r.exercises.length - 3} more` : ""}</p>
                  <div style={{ display: "flex", gap: 24 }}>
                    <div><Label style={{ fontSize: 9 }}>Duration</Label><p style={{ margin: 0, color: C.cyan, fontFamily: "monospace", fontSize: 15 }}>{r.mins} min</p></div>
                    <div><Label style={{ fontSize: 9 }}>Volume</Label><p style={{ margin: 0, color: C.cyan, fontFamily: "monospace", fontSize: 15 }}>{volumeOf(r).toLocaleString()} kg</p></div>
                  </div>
                </>
              )}
            </button>

            {expanded && !skipped && (
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid " + C.soft }}>
                {r.exercises.map((e) => (
                  <div key={e.name} style={{ marginBottom: 8 }}>
                    <p style={{ margin: 0, color: C.text, fontSize: 13, fontWeight: 600 }}>{e.name}</p>
                    <p style={{ margin: "2px 0 0", color: C.muted, fontSize: 12, fontFamily: "monospace" }}>
                      {e.sets.map((t) => (t.type === "warmup" ? "W " : "") + setText(e.unit, t)).join("  ·  ")}
                    </p>
                  </div>
                ))}
                <button onClick={() => remove(r.id)} style={{ background: "none", border: "none", color: C.muted, fontSize: 12, padding: "6px 0 0", display: "flex", alignItems: "center", gap: 6 }}><Trash2 size={13} /> Delete this workout</button>
              </div>
            )}
            {skipped && (
              <button onClick={() => remove(r.id)} style={{ background: "none", border: "none", color: C.muted, fontSize: 12, padding: "8px 0 0", display: "flex", alignItems: "center", gap: 6 }}><Trash2 size={13} /> Remove</button>
            )}
          </Card>
        );
      })}

      {list.length > limit && (
        <button onClick={() => setLimit((l) => l + 30)} style={{ ...pillBtn, width: "100%", padding: 10 }}>Show more</button>
      )}
    </Screen>
  );
}
