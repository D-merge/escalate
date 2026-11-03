// Date helpers. All dates are local "YYYY-MM-DD" strings. Weeks start on Monday.

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const pad = (n) => String(n).padStart(2, "0");

export const iso = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parse = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (s, n) => {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};

export const dow = (s) => parse(s).getDay(); // 0 = Sun ... 6 = Sat

export const fmt = (s) => {
  const d = parse(s);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

export const monthLabel = (s) => MONTHS[parse(s).getMonth()];

export const weekStart = (s) => {
  const d = parse(s);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return iso(d);
};

export const diffDays = (a, b) => Math.round((parse(a) - parse(b)) / 86400000);

export const endOfMonthsAgo = (today, monthsAgo) => {
  if (monthsAgo === 0) return today;
  const d = parse(today);
  // day 0 of (this month - monthsAgo + 1) = last day of (this month - monthsAgo)
  return iso(new Date(d.getFullYear(), d.getMonth() - monthsAgo + 1, 0));
};
