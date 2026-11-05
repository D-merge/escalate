// A tiny synthwave backing track made live with the Web Audio API.
// No audio files, nothing to download. Off by default; the toggle button starts it.

const BPM = 104;
const STEP = 60 / BPM / 4; // one 16th note, in seconds
const mtof = (n) => 440 * Math.pow(2, (n - 69) / 12);

// Am - F - C - G, one chord per bar
const CHORDS = [
  { bass: 45, arp: [57, 60, 64, 69], pad: [57, 60, 64] },
  { bass: 41, arp: [53, 57, 60, 65], pad: [53, 57, 60] },
  { bass: 48, arp: [55, 60, 64, 67], pad: [55, 60, 64] },
  { bass: 43, arp: [55, 59, 62, 67], pad: [55, 59, 62] },
];
const ARP = [0, 2, 1, 3, 2, 3, 1, 2, 0, 2, 1, 3, 2, 3, 2, 1];

let ctx = null;
let master = null;
let echo = null;
let noise = null;
let timer = null;
let nextTime = 0;
let step = 0;
let on = false;

function setup() {
  const AC = window.AudioContext || window.webkitAudioContext;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  master.connect(comp);
  comp.connect(ctx.destination);

  // dotted-eighth echo for the arpeggio
  echo = ctx.createDelay(1);
  echo.delayTime.value = STEP * 3;
  const fb = ctx.createGain();
  fb.gain.value = 0.38;
  const wet = ctx.createGain();
  wet.gain.value = 0.35;
  echo.connect(fb);
  fb.connect(echo);
  echo.connect(wet);
  wet.connect(master);

  const len = ctx.sampleRate;
  noise = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
}

function tone({ freq, t, dur, type = "sawtooth", vol = 0.2, cutoff = 2000, attack = 0.005, send = 0, detune = 0 }) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  o.detune.value = detune;
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = cutoff;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f);
  f.connect(g);
  g.connect(master);
  if (send) {
    const s = ctx.createGain();
    s.gain.value = send;
    g.connect(s);
    s.connect(echo);
  }
  o.start(t);
  o.stop(t + dur + 0.05);
}

function kick(t) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.13);
  g.gain.setValueAtTime(0.9, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + 0.3);
}

function hit(t, { type, freq, q = 1, vol, dur }) {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.02);
}

function schedule(s, t) {
  const bar = Math.floor(s / 16) % CHORDS.length;
  const i = s % 16;
  const c = CHORDS[bar];

  if (i === 0 || i === 8 || (i === 10 && bar % 2 === 1)) kick(t);
  if (i === 4 || i === 12) {
    hit(t, { type: "bandpass", freq: 1900, q: 0.8, vol: 0.5, dur: 0.18 });
    tone({ freq: 190, t, dur: 0.1, type: "triangle", vol: 0.25, cutoff: 1500 });
  }
  if (i % 2 === 0) hit(t, { type: "highpass", freq: 7500, vol: i % 4 === 2 ? 0.22 : 0.12, dur: i % 4 === 2 ? 0.09 : 0.04 });

  if (i % 2 === 0) {
    const n = i % 8 === 6 ? c.bass + 12 : c.bass;
    tone({ freq: mtof(n), t, dur: STEP * 1.8, vol: 0.34, cutoff: 700 + (i % 4 === 0 ? 400 : 0) });
  }

  tone({ freq: mtof(c.arp[ARP[i]] + (i >= 8 && i % 4 === 3 ? 12 : 0)), t, dur: STEP * 1.6, vol: 0.11, cutoff: 1800 + bar * 150, send: 0.6, detune: 6 });

  if (i === 0) {
    c.pad.forEach((n, k) => {
      tone({ freq: mtof(n), t, dur: STEP * 16, vol: 0.05, cutoff: 900, attack: 0.5, detune: k * 7 - 7 });
      tone({ freq: mtof(n), t, dur: STEP * 16, vol: 0.04, type: "square", cutoff: 600, attack: 0.6, detune: 9 - k * 5 });
    });
  }
}

function tick() {
  while (nextTime < ctx.currentTime + 0.15) {
    schedule(step, nextTime);
    nextTime += STEP;
    step++;
  }
}

export const musicOn = () => on;

export async function startMusic() {
  if (on) return true;
  try {
    if (!ctx) setup();
    if (ctx.state === "suspended") await ctx.resume();
    on = true;
    step = 0;
    nextTime = ctx.currentTime + 0.08;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.6);
    clearInterval(timer);
    timer = setInterval(tick, 25);
    return true;
  } catch {
    on = false;
    return false;
  }
}

export function stopMusic() {
  on = false;
  clearInterval(timer);
  if (ctx && master) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
  }
}

// Pause when the app is backgrounded, resume when it comes back (if still on).
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.visibilityState === "hidden") ctx.suspend();
    else if (on) ctx.resume();
  });
}
