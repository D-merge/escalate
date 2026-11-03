// Everything is stored on the phone in IndexedDB (one record holding the whole app state).
// Nothing is sent anywhere.

import { iso } from "./dates.js";
import { emptyState } from "./engine.js";

const DB_NAME = "strength-tracker";
const STORE = "kv";
const KEY = "state";

let dbPromise = null;
function getDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

export async function loadState() {
  try {
    const db = await getDb();
    const saved = await new Promise((resolve, reject) => {
      const r = db.transaction(STORE).objectStore(STORE).get(KEY);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => reject(r.error);
    });
    return saved ? normalise(saved) : null;
  } catch {
    return null;
  }
}

export async function saveState(state) {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(state, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Ask the browser not to evict this data when storage is low.
export async function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persist) return await navigator.storage.persist();
  } catch {
    /* ignore */
  }
  return false;
}

// Fill in any fields missing from older / imported data.
export function normalise(data) {
  const base = emptyState();
  return {
    ...base,
    ...data,
    profile: { ...base.profile, ...(data.profile || {}) },
    settings: { ...base.settings, ...(data.settings || {}) },
    sessions: Array.isArray(data.sessions) ? data.sessions : [],
    weightLog: Array.isArray(data.weightLog) ? data.weightLog : [],
    goals: Array.isArray(data.goals) && data.goals.length ? data.goals : base.goals,
  };
}

export function downloadBackup(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `strength-tracker-backup-${iso()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function parseBackup(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file isn't a valid backup (couldn't read it).");
  }
  if (!data || typeof data !== "object" || !Array.isArray(data.sessions) || !data.profile || typeof data.version !== "number") {
    throw new Error("That file doesn't look like an Escalate backup.");
  }
  return normalise(data);
}
