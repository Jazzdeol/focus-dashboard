'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell, Trophy, Flame, Globe, Moon, ListChecks, Sparkles, Plus } from 'lucide-react';
import { Card, SectionTitle, AddRow, DeleteBtn, Check, Empty } from './ui';
import { getJSON, postJSON, patchJSON, del, currentYear, pop } from '@/lib/client';
import WorldExplorer from './WorldExplorer';

type YGoal = { id: number; goal: string; completed: boolean };
type Wrapped = {
  year: number; workouts: number; habitChecks: number; achievements: number;
  bucketDone: number; goalsAchieved: number; countries: string[];
  avgSleep: number | null; nightsTracked: number; foodDays: number;
  totalProtein: number; topLift: { name: string; weight: number } | null;
};
type Place = { id: number; name: string };

function WrappedCard({ year }: { year: number }) {
  const [w, setW] = useState<Wrapped | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [draft, setDraft] = useState('');
  const loadAll = () => {
    getJSON(`/api/wrapped?year=${year}`).then(setW);
    getJSON(`/api/places?year=${year}`).then(setPlaces);
  };
  useEffect(() => { loadAll(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [year]);
  const addPlace = async () => {
    if (!draft.trim()) return;
    const p = await postJSON('/api/places', { name: draft.trim(), year });
    setPlaces(prev => [...prev, p]); setDraft(''); pop();
    getJSON(`/api/wrapped?year=${year}`).then(setW);
  };
  const removePlace = async (id: number) => { await del(`/api/places/${id}`); setPlaces(prev => prev.filter(p => p.id !== id)); };

  const stats = w ? [
    { icon: Dumbbell, label: 'workouts logged', value: w.workouts, color: 'var(--terra)' },
    { icon: Flame, label: 'habit check-ins', value: w.habitChecks, color: 'var(--rose)' },
    { icon: Trophy, label: 'achievements', value: w.achievements, color: 'var(--gold)' },
    { icon: ListChecks, label: 'goals achieved', value: w.goalsAchieved, color: 'var(--sage)' },
    { icon: Globe, label: 'countries visited', value: w.countries.length, color: 'var(--sky)' },
    { icon: Sparkles, label: 'bucket-list ticks', value: w.bucketDone, color: 'var(--plum)' },
  ] : [];

  return (
    <Card style={{ background: 'linear-gradient(160deg, var(--plum-soft), var(--card) 55%)' }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--plum)', fontWeight: 700 }}>Your</div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 34, fontWeight: 700, lineHeight: 1 }}>{year} Wrapped</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>everything you did this year, in one place</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: 'var(--card)', border: `1px solid ${s.color}33`, borderRadius: 13, padding: '14px 12px', textAlign: 'center' }}>
              <Icon size={18} style={{ color: s.color, marginBottom: 4 }} />
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--serif)', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 3 }}>{s.label}</div>
            </div>
          );
        })}
      </div>
      {w && (w.avgSleep != null || w.topLift || w.totalProtein > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
          {w.topLift && <span style={{ fontSize: 13, background: 'var(--terra)18', color: 'var(--terra)', borderRadius: 20, padding: '5px 12px' }}><Dumbbell size={12} style={{ verticalAlign: -2 }} /> Heaviest lift: {w.topLift.name} {Number(w.topLift.weight)}kg</span>}
          {w.avgSleep != null && <span style={{ fontSize: 13, background: 'var(--plum)18', color: 'var(--plum)', borderRadius: 20, padding: '5px 12px' }}><Moon size={12} style={{ verticalAlign: -2 }} /> Avg sleep: {w.avgSleep}h ({w.nightsTracked} nights)</span>}
          {w.totalProtein > 0 && <span style={{ fontSize: 13, background: 'var(--sky)18', color: 'var(--sky)', borderRadius: 20, padding: '5px 12px' }}>{w.totalProtein.toLocaleString()}g protein logged</span>}
        </div>
      )}
      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Globe size={15} style={{ color: 'var(--sky)' }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Countries visited{places.length ? ` (${places.length})` : ''}</span>
        </div>
        {places.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <WorldExplorer countries={places.map(p => p.name)} />
          </div>
        )}
        {places.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {places.map(p => (
              <span key={p.id} style={{ fontSize: 13, background: 'var(--sky-soft)', border: '1px solid var(--sky)44', borderRadius: 16, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                {p.name}
                <button onClick={() => removePlace(p.id)} style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', padding: 0, opacity: 0.5 }}>×</button>
              </span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Add a country you visited…" value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPlace()} />
          <button onClick={addPlace} style={{ background: 'var(--sky)', color: '#fff', border: 'none', borderRadius: 9, padding: '0 14px', flexShrink: 0, display: 'flex', alignItems: 'center' }}><Plus size={16} /></button>
        </div>
      </div>
    </Card>
  );
}

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
      <div style={{ marginBottom: 16 }}><WrappedCard year={year} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, alignItems: 'start' }}>
        <GoalsCard year={year} />
        <ReflectionCard year={year} />
      </div>
    </div>
  );
}
