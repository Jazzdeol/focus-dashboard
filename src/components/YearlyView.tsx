'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, SectionTitle, AddRow, DeleteBtn, Check, Empty } from './ui';
import { getJSON, postJSON, patchJSON, del, currentYear, pop } from '@/lib/client';

type YGoal = { id: number; goal: string; completed: boolean };

const QUESTIONS = [
  'What went well this year?',
  'What challenged you, and what did it teach you?',
  'What are you most grateful for?',
  'What do you want to carry into next year?',
];

function GoalsCard({ year }: { year: number }) {
  const [goals, setGoals] = useState<YGoal[]>([]);
  useEffect(() => { getJSON(`/api/yearly-goals?year=${year}`).then(setGoals); }, [year]);
  const add = async (goal: string) => { const r = await postJSON('/api/yearly-goals', { year, goal }); setGoals(p => [...p, r]); };
  const toggle = async (g: YGoal) => { if (!g.completed) pop(); await patchJSON(`/api/yearly-goals/${g.id}`, { completed: !g.completed }); setGoals(p => p.map(x => x.id === g.id ? { ...x, completed: !x.completed } : x)); };
  const remove = async (id: number) => { await del(`/api/yearly-goals/${id}`); setGoals(p => p.filter(g => g.id !== id)); };
  const done = goals.filter(g => g.completed).length;
  const pct = goals.length ? Math.round((done / goals.length) * 100) : 0;
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <SectionTitle sub={`${done} of ${goals.length} achieved`}>Goals for {year}</SectionTitle>
        <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--serif)', color: 'var(--plum)' }}>{pct}%</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
        {goals.length === 0 && <Empty>Set your big goals for the year.</Empty>}
        {goals.map(g => (
          <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: g.completed ? 0.5 : 1 }}>
            <Check checked={g.completed} onClick={() => toggle(g)} color="var(--plum)" />
            <span style={{ flex: 1, fontSize: 15, textDecoration: g.completed ? 'line-through' : 'none' }}>{g.goal}</span>
            <DeleteBtn onClick={() => remove(g.id)} />
          </div>
        ))}
      </div>
      <AddRow placeholder="A goal for the year…" onAdd={add} />
    </Card>
  );
}

function ReflectionCard({ year }: { year: number }) {
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '', q4: '' });
  const [saved, setSaved] = useState(true);
  useEffect(() => { getJSON(`/api/yearly-reflection?year=${year}`).then(r => { setAnswers({ q1: r.q1 || '', q2: r.q2 || '', q3: r.q3 || '', q4: r.q4 || '' }); setSaved(true); }); }, [year]);
  useEffect(() => {
    if (saved) return;
    const t = setTimeout(() => { postJSON('/api/yearly-reflection', { year, ...answers }).then(() => setSaved(true)); }, 800);
    return () => clearTimeout(t);
  }, [answers, saved, year]);
  const keys = ['q1', 'q2', 'q3', 'q4'] as const;
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <SectionTitle sub="Take a quiet moment to look back">Year in reflection</SectionTitle>
        <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{saved ? 'Saved' : 'Saving…'}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {keys.map((k, idx) => (
          <div key={k}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6, fontFamily: 'var(--serif)' }}>{QUESTIONS[idx]}</label>
            <textarea value={answers[k]} onChange={e => { setAnswers(a => ({ ...a, [k]: e.target.value })); setSaved(false); }} placeholder="Write freely…" style={{ minHeight: 70, resize: 'vertical', lineHeight: 1.6 }} />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function YearlyView() {
  const [year, setYear] = useState(currentYear());
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={() => setYear(y => y - 1)} aria-label="Previous year" style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10, padding: 8, display: 'flex' }}><ChevronLeft size={18} /></button>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 34, fontWeight: 700, minWidth: 110, textAlign: 'center' }}>{year}</div>
        <button onClick={() => setYear(y => y + 1)} aria-label="Next year" style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10, padding: 8, display: 'flex' }}><ChevronRight size={18} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, alignItems: 'start' }}>
        <GoalsCard year={year} />
        <ReflectionCard year={year} />
      </div>
    </div>
  );
}
