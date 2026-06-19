'use client';
import React, { useState, useEffect } from 'react';
import { Footprints, Smartphone, Calendar, X, Activity } from 'lucide-react';
import { Card, SectionTitle } from './ui';
import { getJSON, postJSON, todayISO, pop } from '@/lib/client';

type Metric = { log_date: string; steps: number | null; screen_minutes: number | null };

// Reusable "connect this later" button + explainer modal.
export function ConnectButton({ label, title, body, color = 'var(--terra)', icon }:
  { label: string; title: string; body: React.ReactNode; color?: string; icon?: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <button onClick={() => setShow(true)} style={{ width: '100%', background: 'transparent', color, border: `1.5px solid ${color}66`, borderRadius: 10, padding: 10, fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        {icon} {label}
      </button>
      {show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(43,36,25,0.45)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShow(false)}>
          <div className="fade-in" style={{ background: 'var(--card)', borderRadius: 18, padding: 26, maxWidth: 400, width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShow(false)} aria-label="Close" style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: 'var(--ink-soft)' }}><X size={18} /></button>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color }}>{icon}</div>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
            <div style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 16 }}>{body}</div>
            <button onClick={() => setShow(false)} style={{ width: '100%', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 10, padding: 11, fontWeight: 600, fontSize: 14 }}>Got it</button>
          </div>
        </div>
      )}
    </>
  );
}

// Steps + screen time — manual daily log, plus a (future) Health-app connect button.
export function StepsScreenCard() {
  const today = todayISO();
  const [recent, setRecent] = useState<Metric[]>([]);
  const [steps, setSteps] = useState('');
  const [hrs, setHrs] = useState('');
  const [mins, setMins] = useState('');
  const load = () => getJSON('/api/daily-metrics').then(setRecent);
  useEffect(() => { load(); }, []);
  const todayRow = recent.find(r => r.log_date.startsWith(today));

  const saveSteps = async () => { if (!steps) return; await postJSON('/api/daily-metrics', { log_date: today, steps: parseInt(steps) }); setSteps(''); load(); };
  const saveScreen = async () => { const total = (parseInt(hrs || '0') * 60) + parseInt(mins || '0'); if (!total) return; await postJSON('/api/daily-metrics', { log_date: today, screen_minutes: total }); setHrs(''); setMins(''); load(); };

  const fmtScreen = (m: number | null) => m == null ? '—' : `${Math.floor(m / 60)}h ${m % 60}m`;
  const last7 = recent.slice(0, 7).reverse();
  const maxSteps = Math.max(8000, ...recent.map(r => r.steps || 0));

  return (
    <Card>
      <SectionTitle sub="Log it each day — or connect a tracker"><Footprints size={17} style={{ display: 'inline', verticalAlign: -3, marginRight: 6, color: 'var(--sage)' }} />Steps & screen time</SectionTitle>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, background: 'var(--sage-soft)', borderRadius: 11, padding: '10px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Steps today</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--sage)' }}>{todayRow?.steps?.toLocaleString() ?? '—'}</div>
        </div>
        <div style={{ flex: 1, background: 'var(--sky-soft)', borderRadius: 11, padding: '10px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Screen today</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--sky)' }}>{fmtScreen(todayRow?.screen_minutes ?? null)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <input type="number" placeholder="Steps today" value={steps} onChange={e => setSteps(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveSteps()} />
        <button onClick={saveSteps} style={{ background: 'var(--sage)', color: '#fff', border: 'none', borderRadius: 8, padding: '0 12px', fontSize: 13, flexShrink: 0 }}>Save</button>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, alignItems: 'center' }}>
        <Smartphone size={15} style={{ color: 'var(--sky)', flexShrink: 0 }} />
        <input type="number" placeholder="hrs" value={hrs} onChange={e => setHrs(e.target.value)} style={{ width: 60 }} />
        <input type="number" placeholder="mins" value={mins} onChange={e => setMins(e.target.value)} style={{ width: 70 }} />
        <button onClick={saveScreen} style={{ background: 'var(--sky)', color: '#fff', border: 'none', borderRadius: 8, padding: '0 12px', fontSize: 13, flexShrink: 0 }}>Save</button>
      </div>

      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 50, marginBottom: 14 }}>
        {last7.map((r, i) => {
          const h = r.steps ? Math.max(6, (r.steps / maxSteps) * 50) : 4;
          const goal = (r.steps || 0) >= 8000;
          return <div key={i} title={`${r.steps?.toLocaleString() || 0} steps`} style={{ flex: 1, background: goal ? 'var(--sage)' : 'var(--line-strong)', height: `${h}px`, borderRadius: 3 }} />;
        })}
        {last7.length === 0 && <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontStyle: 'italic' }}>Log a few days to see your trend.</span>}
      </div>

      <ConnectButton
        label="Connect Health app"
        color="var(--sage)"
        icon={<Activity size={16} />}
        title="Auto-import your steps"
        body={<>
          Heads-up: this one&apos;s trickier than the calendar. A website can&apos;t read your phone&apos;s <strong>Apple Health</strong> or <strong>Google Fit</strong> directly — they don&apos;t allow web access.
          <br /><br />
          The realistic way to pull steps in automatically is to connect a fitness service that <em>does</em> have a web link — like <strong>Fitbit, Garmin, Oura or Strava</strong>. If you use one of those, tell Claude <strong>&ldquo;connect my [tracker]&rdquo;</strong> and we&apos;ll wire it up. Until then, the manual log above keeps everything tracked.
        </>}
      />
    </Card>
  );
}

// Daily mood — a gentle 1–5 check-in with a little trend.
export function MoodCard() {
  const today = todayISO();
  const [recent, setRecent] = useState<{ log_date: string; rating: number; note: string }[]>([]);
  const [note, setNote] = useState('');
  const load = () => getJSON('/api/mood').then(setRecent);
  useEffect(() => { load(); }, []);
  const todayRow = recent.find(r => r.log_date.startsWith(today));
  const FACES = [
    { r: 1, e: '😞', c: 'var(--terra)' }, { r: 2, e: '😕', c: 'var(--gold)' },
    { r: 3, e: '😐', c: 'var(--sky)' }, { r: 4, e: '🙂', c: 'var(--sage)' }, { r: 5, e: '😄', c: 'var(--plum)' },
  ];
  const setMood = async (rating: number) => { pop(); await postJSON('/api/mood', { log_date: today, rating, note: todayRow?.note || note }); load(); };
  const saveNote = async () => { if (!todayRow) return; await postJSON('/api/mood', { log_date: today, rating: todayRow.rating, note }); load(); };

  return (
    <Card>
      <SectionTitle sub="A quick daily check-in">How are you today?</SectionTitle>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginBottom: 12 }}>
        {FACES.map(f => (
          <button key={f.r} onClick={() => setMood(f.r)} style={{
            flex: 1, fontSize: 26, padding: '8px 0', borderRadius: 10, cursor: 'pointer',
            background: todayRow?.rating === f.r ? f.c + '22' : 'var(--paper2)',
            border: todayRow?.rating === f.r ? `2px solid ${f.c}` : '2px solid transparent',
          }}>{f.e}</button>
        ))}
      </div>
      {todayRow && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <input placeholder="A word on why (optional)" defaultValue={todayRow.note} value={note || todayRow.note} onChange={e => setNote(e.target.value)} onBlur={saveNote} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'center' }}>
        {recent.slice(0, 14).reverse().map((r, i) => {
          const f = FACES.find(x => x.r === r.rating);
          return <span key={i} title={`${r.log_date.slice(5, 10)}: ${r.rating}/5`} style={{ width: 14, height: 14, borderRadius: '50%', background: f?.c || 'var(--line)', opacity: 0.85 }} />;
        })}
        {recent.length === 0 && <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontStyle: 'italic' }}>Tap a face to start tracking.</span>}
      </div>
      {recent.length > 0 && <p style={{ fontSize: 11, color: 'var(--ink-soft)', textAlign: 'center', marginTop: 6 }}>last {Math.min(recent.length, 14)} days</p>}
    </Card>
  );
}

// Google Calendar connect button — ready to wire up when the user decides.
export function GoogleCalCard() {
  return (
    <Card>
      <SectionTitle sub="Bring your schedule in (when you're ready)"><Calendar size={17} style={{ display: 'inline', verticalAlign: -3, marginRight: 6, color: 'var(--terra)' }} />Google Calendar</SectionTitle>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: 14 }}>
        Not connected yet. When you want your calendar events to show up here, hit the button and I&apos;ll walk you through the one-time setup.
      </p>
      <ConnectButton
        label="Connect Google Calendar"
        color="var(--terra)"
        icon={<Calendar size={16} />}
        title="Connecting your calendar"
        body={<>
          Hooking up Google Calendar needs a quick one-time setup (a Google sign-in permission, similar to how Notion was connected). It&apos;s a few steps and I&apos;ll guide you through each one.
          <br /><br />
          Whenever you&apos;re ready, just tell Claude <strong>&ldquo;let&apos;s connect Google Calendar&rdquo;</strong> and we&apos;ll switch it on together.
        </>}
      />
    </Card>
  );
}
