'use client';
import confetti from 'canvas-confetti';

// ── Celebration: confetti burst + pop sound ───────────────────────────
let audioCtx: AudioContext | null = null;

export function pop() {
  confetti({
    particleCount: 70, spread: 70, origin: { y: 0.7 },
    colors: ['#a78bfa', '#f472b6', '#4ade80', '#fbbf24', '#60a5fa'], scalar: 0.9,
  });
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const ctx = audioCtx; const now = ctx.currentTime;
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.start(now); osc.stop(now + 0.2);
  } catch { /* audio not available */ }
}

// ── Date helpers (LOCAL time, UK-friendly, Monday–Sunday weeks) ───────
// IMPORTANT: we build dates from LOCAL components, never toISOString(),
// because toISOString() uses UTC and can roll the date over by a day.
export function localISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function mondayOf(d: Date = new Date()): string {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (date.getDay() + 6) % 7; // Mon = 0 … Sun = 6
  date.setDate(date.getDate() - day);
  return localISO(date);
}

export function weekDays(weekStart: string): { iso: string; label: string; short: string }[] {
  const [y, m, d] = weekStart.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(start);
    dt.setDate(start.getDate() + i);
    return {
      iso: localISO(dt),
      label: dt.toLocaleDateString('en-GB', { weekday: 'long' }),
      short: dt.toLocaleDateString('en-GB', { weekday: 'short' }),
    };
  });
}

export const todayISO = () => localISO();

export function currentQuarter(): string {
  const now = new Date();
  return `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;
}

export function currentYear(): number { return new Date().getFullYear(); }

// ── Tiny fetch wrappers ───────────────────────────────────────────────
export const getJSON = (url: string) => fetch(url).then(r => r.json());
export const postJSON = (url: string, body: unknown) =>
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json());
export const patchJSON = (url: string, body: unknown) =>
  fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json());
export const del = (url: string) => fetch(url, { method: 'DELETE' });
