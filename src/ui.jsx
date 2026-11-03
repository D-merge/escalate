import React, { useEffect, useState } from "react";
import { Check, Plus, Minus, ChevronLeft, Palmtree, SkipForward } from "lucide-react";
import { C, pillBtn, bigBtn } from "./theme.js";
import { LIBRARY } from "./program.js";

export function Hex({ children, size = 64, color = C.cyan, font = 22 }) {
  const clip = "polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)";
  return (
    <div style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
      <div style={{ position: "absolute", inset: 0, background: color, clipPath: clip, boxShadow: "0 0 18px " + color }} />
      <div style={{ position: "absolute", inset: 3, background: C.night, clipPath: clip, display: "flex", alignItems: "center", justifyContent: "center", color: C.text, fontWeight: 700, fontSize: font, fontFamily: "monospace" }}>
        {children}
      </div>
    </div>
  );
}

export function Sun() {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100, overflow: "hidden", pointerEvents: "none", opacity: 0.85 }}>
      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: 8, width: 70, height: 70, borderRadius: 999, background: "linear-gradient(180deg,#FFE37D 0%,#FF8A3D 55%,#FF3EA5 100%)", boxShadow: "0 0 40px 6px rgba(255,138,61,0.5)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 44, backgroundImage: "repeating-linear-gradient(0deg, rgba(45,226,230,0.45) 0px, rgba(45,226,230,0.45) 1px, transparent 1px, transparent 6px)" }} />
      <Palmtree size={30} strokeWidth={1.5} style={{ position: "absolute", left: 8, bottom: 0, color: C.night }} />
      <Palmtree size={24} strokeWidth={1.5} style={{ position: "absolute", right: 10, bottom: 0, color: C.night, transform: "scaleX(-1)" }} />
    </div>
  );
}

export const Card = ({ children, style }) => (
  <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 18, padding: 16, ...style }}>{children}</div>
);

export const Label = ({ children, style }) => (
  <p style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: 0, ...style }}>{children}</p>
);

export const Title = ({ children, style }) => (
  <h1 style={{ fontSize: 24, fontWeight: 800, fontStyle: "italic", color: C.text, margin: "0 0 14px", ...style }}>{children}</h1>
);

export const BackBtn = ({ onClick, children }) => (
  <button onClick={onClick} style={{ background: "none", border: "none", color: C.pink, display: "flex", alignItems: "center", gap: 2, fontSize: 13, padding: 0, marginBottom: 8 }}>
    <ChevronLeft size={16} /> {children}
  </button>
);

export const Badge = ({ text, color }) => (
  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color, border: "1px solid " + color, borderRadius: 999, padding: "2px 8px" }}>{text}</span>
);

export const Screen = ({ children, pad = "8px 18px 24px" }) => (
  <div style={{ flex: 1, overflowY: "auto", padding: pad }}>{children}</div>
);

export function Sheet({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 30, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxHeight: "88%", overflowY: "auto", background: C.card, borderTop: "1px solid " + C.border, borderRadius: "20px 20px 0 0", padding: "18px 20px calc(24px + env(safe-area-inset-bottom))" }}>
        <div style={{ width: 40, height: 4, borderRadius: 999, background: C.border, margin: "0 auto 16px" }} />
        {children}
      </div>
    </div>
  );
}

// Exercise picker. `prefer` floats one muscle group to the top (used when swapping).
export function Picker({ prefer, onPick, onClose, title = "Pick an exercise" }) {
  const items = prefer
    ? [...LIBRARY.filter((l) => l.muscle === prefer), ...LIBRARY.filter((l) => l.muscle !== prefer)]
    : LIBRARY;
  return (
    <Sheet onClose={onClose}>
      <Label style={{ marginBottom: 10 }}>{title}</Label>
      {items.map((l) => (
        <button key={l.name} onClick={() => onPick(l)} style={{ width: "100%", textAlign: "left", background: C.chip, border: "none", borderRadius: 12, padding: "11px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", color: C.text, fontSize: 14 }}>
          {l.name}
          <span style={{ color: prefer && l.muscle === prefer ? C.pink : C.muted, fontSize: 11 }}>{l.muscle}</span>
        </button>
      ))}
      <button onClick={onClose} style={{ width: "100%", padding: 10, background: "none", border: "none", color: C.muted, fontSize: 13 }}>Cancel</button>
    </Sheet>
  );
}

export const SKIP_REASONS = ["Tired", "Sick or injured", "No time", "Other"];

export function SkipSheet({ name, reason, setReason, onCancel, onConfirm }) {
  return (
    <Sheet onClose={onCancel}>
      <p style={{ margin: "0 0 6px", color: C.text, fontSize: 20, fontWeight: 800, fontStyle: "italic" }}>Skip {name}?</p>
      <p style={{ margin: "0 0 16px", color: C.muted, fontSize: 13 }}>It won't count toward your weekly goal and shows in History as skipped.</p>
      <Label style={{ marginBottom: 8 }}>Reason</Label>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {SKIP_REASONS.map((r) => (
          <button key={r} onClick={() => setReason(r)} style={{ ...pillBtn, background: reason === r ? C.pink : C.chip, color: reason === r ? C.night : C.muted, borderColor: reason === r ? C.pink : C.border }}>{r}</button>
        ))}
      </div>
      <button onClick={onConfirm} style={{ ...bigBtn(true), marginBottom: 6 }}>Skip workout</button>
      <button onClick={onCancel} style={{ width: "100%", padding: 10, background: "none", border: "none", color: C.muted, fontSize: 13 }}>Keep it</button>
    </Sheet>
  );
}

export function SetRow({ s, idx, unit, step = 2.5, onChange, hideDone }) {
  const on = s.done && !hideDone;
  const secs = unit === "secs";
  const bw = unit === "bw";
  const num = (v) => (v === "" ? "" : Number(v));
  const box = { flex: 1, minWidth: 0, background: C.night, border: "1px solid " + (on ? C.green : C.border), borderRadius: 10, color: on ? C.green : C.cyan, fontFamily: "monospace", fontSize: 17, textAlign: "center", padding: "8px 2px", outline: "none" };
  const btn = { width: 26, height: 26, borderRadius: 999, background: C.chip, color: C.muted, border: "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0 };
  const repStep = secs ? 5 : 1;
  const chip = s.type === "warmup" ? "W" : s.amrap ? "MAX" : idx;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
      <div style={{ width: 32, height: 36, flexShrink: 0, borderRadius: 10, background: C.chip, color: s.type === "warmup" ? C.orange : s.amrap ? C.pink : C.text, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: s.amrap ? 9 : 13 }}>
        {chip}
      </div>
      <button style={btn} onClick={() => onChange({ reps: Math.max(0, (Number(s.reps) || 0) - repStep) })}><Minus size={12} /></button>
      <input type="number" inputMode="decimal" value={s.reps} onFocus={(e) => e.target.select()} onChange={(e) => onChange({ reps: num(e.target.value) })} style={box} />
      <button style={btn} onClick={() => onChange({ reps: (Number(s.reps) || 0) + repStep })}><Plus size={12} /></button>
      {!secs && (
        <>
          <span style={{ color: C.muted, fontSize: 12, flexShrink: 0 }}>{bw ? "+kg" : "×"}</span>
          <button style={btn} onClick={() => onChange({ weight: Math.max(0, (Number(s.weight) || 0) - step) })}><Minus size={12} /></button>
          <input type="number" inputMode="decimal" value={s.weight} onFocus={(e) => e.target.select()} onChange={(e) => onChange({ weight: num(e.target.value) })} style={box} />
          <button style={btn} onClick={() => onChange({ weight: (Number(s.weight) || 0) + step })}><Plus size={12} /></button>
        </>
      )}
      {!hideDone && (
        <button onClick={() => onChange({ done: !s.done })} style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 999, border: "none", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, background: s.done ? `linear-gradient(135deg,${C.cyan},${C.green})` : C.chip, color: s.done ? C.night : C.muted }}>
          <Check size={16} />
        </button>
      )}
    </div>
  );
}

// Countdown that appears after you tick a set. Only runs while the app is open.
export function RestTimer({ until, onClose }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, Math.ceil((until - now) / 1000));
  const over = left === 0;
  useEffect(() => {
    if (!over) return undefined;
    try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch { /* ignore */ }
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [over]); // eslint-disable-line react-hooks/exhaustive-deps
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div style={{ margin: "0 14px 8px", padding: "10px 14px", borderRadius: 14, background: over ? `linear-gradient(90deg,${C.cyan},${C.green})` : C.card, border: "1px solid " + (over ? C.green : C.border), display: "flex", alignItems: "center", justifyContent: "space-between", color: over ? C.night : C.text, flexShrink: 0 }}>
      <span style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>{over ? "Rest over — go!" : "Rest"}</span>
      <span style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 700, color: over ? C.night : C.cyan }}>{mm}:{ss}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: over ? C.night : C.muted, display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
        <SkipForward size={14} /> Skip
      </button>
    </div>
  );
}
