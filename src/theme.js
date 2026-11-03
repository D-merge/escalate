export const C = {
  night: "#1A0B2E", card: "#2B1550", border: "#6B3FA0", chip: "#3A1E68",
  soft: "#4A2A78", text: "#FDF3FF", muted: "#C9AEE8",
  pink: "#FF3EA5", cyan: "#2DE2E6", orange: "#FF8A3D", green: "#3EE6A5",
};

export const grad = `linear-gradient(90deg,${C.pink},${C.orange})`;
export const gradCool = `linear-gradient(90deg,${C.cyan},${C.pink})`;

export const pillBtn = {
  padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
  border: "1px solid " + C.border, background: C.chip, color: C.muted,
};

export const bigBtn = (on = true) => ({
  width: "100%", padding: 14, borderRadius: 999, border: "none", fontWeight: 800, fontSize: 14,
  background: on ? grad : C.chip, color: on ? C.night : "#6B5A8A",
});

export const ghostBtn = {
  width: "100%", padding: 11, borderRadius: 999, background: "transparent",
  border: "1px solid " + C.border, color: C.muted, fontWeight: 600, fontSize: 13,
  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
};

export const fieldStyle = {
  background: C.night, border: "1px solid " + C.border, borderRadius: 10, color: C.text,
  fontSize: 16, padding: "10px 12px", outline: "none", width: "100%",
};
