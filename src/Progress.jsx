import React, { useState } from "react";
import { Flame, Trophy, Target, Trash2, Plus } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { C, pillBtn, bigBtn, fieldStyle, gradCool } from "./theme.js";
import { lib, uid, muscleScores, overallFrom, levelFor, scoreHistory, goalProgress, streakInfo, activityGrid } from "./engine.js";
import { Hex, Card, Label, Title, Screen, Sheet, Picker } from "./ui.jsx";
import { LEVELS } from "./program.js";

function GoalCard({ g, p }) {
  const m = lib(g.exercise);
  const title = p.kind === "reps" ? `${g.exercise} — ${g.reps} reps` : `${g.exercise} — ${g.weight}kg × ${g.reps}`;
  const current = p.kind === "reps" ? `${p.current} reps` : p.current > 0 ? `${p.current}kg` : "—";
  const target = p.kind === "reps" ? `${p.target} reps` : `${p.target}kg`;
  const togo = p.done
    ? "Goal reached"
    : p.kind === "reps"
      ? `${p.target - p.current} more rep${p.target - p.current === 1 ? "" : "s"} to go`
      : p.current > 0 ? `about ${Math.round((p.target - p.current) * 2) / 2}kg to go` : "no sets logged yet";
  return (
    <div style={{ background: C.card, border: "1px solid " + (p.done ? C.green : C.border), borderRadius: 18, padding: 14, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <p style={{ margin: 0, color: C.text, fontSize: 14, fontWeight: 600 }}>{title}</p>
        <span style={{ color: C.muted, fontSize: 12, fontFamily: "monospace" }}>{p.pct}%</span>
      </div>
      <p style={{ margin: "0 0 8px", color: C.text, fontFamily: "monospace", fontSize: 20 }}>
        {current}<span style={{ color: C.muted, fontSize: 13 }}> / {target}</span>
      </p>
      <div style={{ height: 6, borderRadius: 4, background: C.night, overflow: "hidden" }}>
        <div style={{ height: "100%", width: p.pct + "%", borderRadius: 4, background: p.done ? `linear-gradient(90deg,${C.green},${C.cyan})` : gradCool }} />
      </div>
      <p style={{ margin: "6px 0 0", color: p.done ? C.green : C.muted, fontSize: 12 }}>
        {togo}{m && m.unit !== "bw" && p.current > 0 && !p.done ? ` (estimated best for ${g.reps} reps)` : ""}
      </p>
    </div>
  );
}

function GoalsSheet({ goals, onSave, onClose }) {
  const [draft, setDraft] = useState(goals.map((g) => ({ ...g })));
  const [adding, setAdding] = useState(false);
  const num = (v) => (v === "" ? "" : Number(v));
  const set = (id, patch) => setDraft((d) => d.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  const small = { ...fieldStyle, textAlign: "center", fontFamily: "monospace", color: C.cyan, padding: "8px 4px", width: 70 };
  return (
    <>
      <Sheet onClose={onClose}>
        <p style={{ margin: "0 0 14px", color: C.text, fontSize: 20, fontWeight: 800, fontStyle: "italic" }}>Your goals</p>
        {draft.map((g) => {
          const bw = (lib(g.exercise) || {}).unit === "bw";
          return (
            <div key={g.id} style={{ marginBottom: 12, background: C.chip, borderRadius: 12, padding: "10px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ color: C.text, fontSize: 14, fontWeight: 600 }}>{g.exercise}</span>
                <button onClick={() => setDraft((d) => d.filter((x) => x.id !== g.id))} style={{ background: "none", border: "none", color: C.muted, padding: 2 }}><Trash2 size={15} /></button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {!bw && (
                  <>
                    <input type="number" inputMode="decimal" value={g.weight} onChange={(e) => set(g.id, { weight: num(e.target.value) })} style={small} />
                    <span style={{ color: C.muted, fontSize: 13 }}>kg ×</span>
                  </>
                )}
                <input type="number" inputMode="numeric" value={g.reps} onChange={(e) => set(g.id, { reps: num(e.target.value) })} style={small} />
                <span style={{ color: C.muted, fontSize: 13 }}>reps{bw ? " in one set" : ""}</span>
              </div>
            </div>
          );
        })}
        <button onClick={() => setAdding(true)} style={{ width: "100%", marginBottom: 16, padding: 11, borderRadius: 12, background: "transparent", border: "1px dashed " + C.border, color: C.muted, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Plus size={13} /> Add goal</button>
        <button onClick={() => onSave(draft.filter((g) => Number(g.reps) > 0 && ((lib(g.exercise) || {}).unit === "bw" || Number(g.weight) > 0)))} style={bigBtn(true)}>Save goals</button>
        <button onClick={onClose} style={{ width: "100%", padding: 10, background: "none", border: "none", color: C.muted, fontSize: 13 }}>Cancel</button>
      </Sheet>
      {adding && (
        <Picker title="Goal exercise" onClose={() => setAdding(false)}
          onPick={(l) => { setDraft((d) => [...d, { id: uid(), exercise: l.name, weight: l.unit === "bw" ? 0 : 20, reps: 10 }]); setAdding(false); }} />
      )}
    </>
  );
}

export default function Progress({ state, update }) {
  const [editing, setEditing] = useState(false);
  const muscles = muscleScores(state);
  const score = overallFrom(muscles);
  const { level, next } = levelFor(score);
  const prevMin = level.min;
  const pct = next ? Math.min(100, ((score - prevMin) / (next.min - prevMin)) * 100) : 100;
  const hist = scoreHistory(state);
  const streak = streakInfo(state);
  const grid = activityGrid(state);
  const heat = (c) => (c.future ? "transparent" : c.n === 0 ? "#1F0F3A" : c.n === 1 ? "#C03EA5" : C.pink);

  return (
    <Screen>
      <Title>Progress</Title>

      {muscles.length ? (
        <Card style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
          <Hex size={84} font={28}>{score}</Hex>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, color: C.text, fontSize: 22, fontWeight: 800 }}>{level.name}</p>
            <p style={{ margin: "2px 0 8px", color: C.muted, fontSize: 12 }}>{next ? `${next.min - score} to ${next.name}` : "Top level"}</p>
            <div style={{ height: 6, borderRadius: 4, background: C.night }}>
              <div style={{ height: "100%", width: pct + "%", borderRadius: 4, background: gradCool }} />
            </div>
          </div>
        </Card>
      ) : (
        <Card style={{ marginBottom: 14 }}>
          <p style={{ margin: 0, color: C.muted, fontSize: 13 }}>Log a workout to unlock your strength score.</p>
        </Card>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <Card style={{ flex: 1, padding: 14 }}>
          <Flame size={22} color={C.orange} />
          <p style={{ margin: "8px 0 0", color: C.text, fontSize: 20, fontWeight: 800 }}>{streak.weeks} week{streak.weeks === 1 ? "" : "s"}</p>
          <p style={{ margin: 0, color: C.muted, fontSize: 12 }}>{streak.thisWeek} / {streak.goal} this week</p>
        </Card>
        <Card style={{ flex: 1, padding: 14 }}>
          <Trophy size={22} color={C.cyan} />
          <p style={{ margin: "8px 0 0", color: C.text, fontSize: 20, fontWeight: 800 }}>{streak.month}</p>
          <p style={{ margin: 0, color: C.muted, fontSize: 12 }}>workouts this month</p>
        </Card>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Label>Goals</Label>
        <button onClick={() => setEditing(true)} style={{ ...pillBtn, color: C.pink, display: "flex", alignItems: "center", gap: 4 }}><Target size={12} /> Edit goals</button>
      </div>
      {state.goals.map((g) => <GoalCard key={g.id} g={g} p={goalProgress(state, g)} />)}

      <Label style={{ margin: "16px 0 8px" }}>Strength history</Label>
      <Card style={{ padding: "12px 8px 4px", marginBottom: 14 }}>
        {hist.length >= 2 ? (
          <div style={{ width: "100%", height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hist}>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.pink} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={C.pink} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={["dataMin - 5", "dataMax + 5"]} hide />
                <Area type="monotone" dataKey="v" stroke={C.pink} strokeWidth={2.5} fill="url(#sg)" dot={{ r: 3, fill: C.cyan, stroke: C.cyan }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p style={{ margin: "4px 8px 12px", color: C.muted, fontSize: 13 }}>Your history chart appears once you've trained across two months.</p>
        )}
      </Card>

      {muscles.length > 0 && (
        <>
          <Label style={{ marginBottom: 8 }}>Breakdown</Label>
          {muscles.map((m) => (
            <div key={m.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.card, border: "1px solid " + C.soft, borderRadius: 14, padding: "10px 14px", marginBottom: 8 }}>
              <span style={{ color: C.text, fontWeight: 600 }}>{m.name}</span>
              <Hex size={44} font={13} color={m.score >= LEVELS[2].min ? C.cyan : C.pink}>{m.score}</Hex>
            </div>
          ))}
          <p style={{ margin: "4px 0 0", color: C.muted, fontSize: 11 }}>Scores use this app's own formula (strength relative to bodyweight), not Gravl's.</p>
        </>
      )}

      <Label style={{ margin: "16px 0 8px" }}>Activity (12 weeks)</Label>
      <Card style={{ padding: 12 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {grid.map((col, w) => (
            <div key={w} style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
              {col.map((c) => <div key={c.date} style={{ aspectRatio: "1 / 1", borderRadius: 4, background: heat(c), border: c.future ? "1px solid " + C.soft : "none" }} />)}
            </div>
          ))}
        </div>
        <p style={{ margin: "8px 0 0", color: C.muted, fontSize: 11 }}>Each column is a week (Mon → Sun), newest on the right.</p>
      </Card>

      {editing && (
        <GoalsSheet goals={state.goals} onClose={() => setEditing(false)}
          onSave={(goals) => { update((s) => ({ ...s, goals })); setEditing(false); }} />
      )}
    </Screen>
  );
}
