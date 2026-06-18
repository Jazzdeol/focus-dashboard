'use client';
import React, { useState, useEffect } from 'react';
import { Footprints, Smartphone, Calendar, X } from 'lucide-react';
import { Card, SectionTitle } from './ui';
import { getJSON, postJSON, todayISO } from '@/lib/client';

type Metric = { log_date: string; steps: number | null; screen_minutes: number | null };

// Steps + screen time. A website can't read these from your phone automatically
// (Apple/Google don't allow it), so this is a quick manual daily log with a chart.
export function StepsScreenCard() {
  const today = todayISO();
  const [recent, setRecent] = useState<Metric[]>([]);
  const [steps, setSteps] = useState('');
  const [hrs, setHrs] = useState('');
  const [mins, setMins] = useState('');
  const load = () => getJSON('/api/daily-metrics').then(setRecent);
  useEffect(() => { load(); }, []);
  const todayRow = recent.find(r => r.log_date.startsWith(today));

  const saveSteps = async () => {
    if (!steps) return;
    await postJSON('/api/daily-metrics', { log_date: today, steps: parseInt(steps) });
    setSteps(''); load();
  };
  const saveScreen = async () => {
    const total = (parseInt(hrs || '0') * 60) + parseInt(mins || '0');
    if (!total) return;
    await postJSON('/api/daily-metrics', { log_date: today, screen_minutes: total });
    setHrs(''); setMins(''); load();
  };

  const fmtScreen = (m: number | null) => m == null ? '—' : `${Math.floor(m / 60)}h ${m % 60}m`;
  const last7 = recent.slice(0, 7).reverse();
  const maxSteps = Math.max(8000, ...recent.map(r => r.steps || 0));

  return (
    <Card>
      <SectionTitle sub="Log it each day — tap from your phone's health app"><Footprints size={17} style={{ display: 'inline', verticalAlign: -3, marginRight: 6, color: 'var(--sage)' }} />Steps & screen time</SectionTitle>

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

      {/* steps mini chart */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 50 }}>
        {last7.map((r, i) => {
          const h = r.steps ? Math.max(6, (r.steps / maxSteps) * 50) : 4;
          const goal = (r.steps || 0) >= 8000;
          return <div key={i} title={`${r.steps?.toLocaleString() || 0} steps`} style={{ flex: 1, background: goal ? 'var(--sage)' : 'var(--line-strong)', height: `${h}px`, borderRadius: 3 }} />;
        })}
        {last7.length === 0 && <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontStyle: 'italic' }}>Log a few days to see your trend.</span>}
      </div>
      {last7.length > 0 && <p style={{ fontSize: 11, color: 'var(--ink-soft)', textAlign: 'center', marginTop: 4 }}>steps · last {last7.length} days (green = 8k+)</p>}
    </Card>
  );
}

// Google Calendar connect button — ready to wire up when the user decides.
export function GoogleCalCard() {
  const [show, setShow] = useState(false);
  return (
    <Card>
      <SectionTitle sub="Bring your schedule in (when you're ready)"><Calendar size={17} style={{ display: 'inline', verticalAlign: -3, marginRight: 6, color: 'var(--terra)' }} />Google Calendar</SectionTitle>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: 14 }}>
        Not connected yet. When you want your calendar events to show up here, hit the button and I&apos;ll walk you through the one-time setup.
      </p>
      <button onClick={() => setShow(true)} style={{ width: '100%', background: 'var(--terra)', color: '#fff', border: 'none', borderRadius: 10, padding: 11, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        <Calendar size={16} /> Connect Google Calendar
      </button>
      {show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(43,36,25,0.45)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShow(false)}>
          <div className="fade-in" style={{ background: 'var(--card)', borderRadius: 18, padding: 26, maxWidth: 400, width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShow(false)} aria-label="Close" style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: 'var(--ink-soft)' }}><X size={18} /></button>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--terra)18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Calendar size={22} style={{ color: 'var(--terra)' }} />
            </div>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Connecting your calendar</h3>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 16 }}>
              Hooking up Google Calendar needs a quick one-time setup (a Google sign-in permission, similar to how Notion was connected). It&apos;s a few steps and I&apos;ll guide you through each one.
              <br /><br />
              Whenever you&apos;re ready, just tell Claude <strong>&ldquo;let&apos;s connect Google Calendar&rdquo;</strong> and we&apos;ll switch it on together.
            </p>
            <button onClick={() => setShow(false)} style={{ width: '100%', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 10, padding: 11, fontWeight: 600, fontSize: 14 }}>Got it</button>
          </div>
        </div>
      )}
    </Card>
  );
}
