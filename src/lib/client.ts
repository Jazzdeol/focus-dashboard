'use client';
import confetti from 'canvas-confetti';

// ── Celebration: confetti burst + pop sound ───────────────────────────
let audioCtx: AudioContext | null = null;

export function pop() {
  // confetti
  confetti({
    particleCount: 70,
    spread: 70,
    origin: { y: 0.7 },
    colors: ['#a78bfa', '#f472b6', '#4ade80', '#fbbf24', '#60a5fa'],
    scalar: 0.9,
  });
  // synthesized pop sound (no asset file needed)
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const ctx = audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
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

// ── Date helpers ──────────────────────────────────────────────────────
export function mondayOf(d = new Date()): string {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Mon = 0
  date.setDate(date.getDate() - day);
  return date.toISOString().split('T')[0];
}

export function weekDays(weekStart: string): { iso: string; label: string; short: string }[] {
  const start = new Date(weekStart + 'T00:00:00');
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      iso: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-GB', { weekday: 'long' }),
      short: d.toLocaleDateString('en-GB', { weekday: 'short' }),
    };
  });
}

export const todayISO = () => new Date().toISOString().split('T')[0];

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
