'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell, Flame, Target, Sparkles, Heart, NotebookPen } from 'lucide-react';
import { Card, SectionTitle, AddRow, DeleteBtn, Check, Empty } from './ui';
import HabitGrid from './HabitGrid';
import { getJSON, postJSON, patchJSON, del, mondayOf, todayISO, pop } from '@/lib/client';

type Task = { id: number; title: string; completed: boolean };
type Gym = { id: number; day_label: string; focus: string; completed: boolean };
type Food = { id: number; food: string; calories: number };
type Goal = { id: number; goal: string; completed: boolean };
type Idea = { id: number; content: string; done: boolean };

function shiftWeek(weekStart: string, dir: number) {
  const d = new Date(weekStart + 'T00:00:00');
  d.setDate(d.getDate() + dir * 7);
  return d.toISOString().split('T')[0];
}
function weekLabel(weekStart: string) {
  const start = new Date(weekStart + 'T00:00:00');
  const end = new Date(start); end.setDate(start.getDate() + 6);
  const opt: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${start.toLocaleDateString('en-GB', opt)} – ${end.toLocaleDateString('en-GB', opt)}`;
}

// ── Tasks ──
function TasksCard({ week }: { week: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => { getJSON(`/api/tasks?week=${week}`).then(setTasks); }, [week]);
  const add = async (title: string) => { const r = await postJSON('/api/tasks', { title, week_start: week }); setTasks(p => [...p, r]); };
  const toggle = async (t: Task) => { if (!t.completed) pop(); await patchJSON(`/api/tasks/${t.id}`, { completed: !t.completed }); setTasks(p => p.map(x => x.id === t.id ? { ...x, completed: !x.completed } : x).sort((a, b) => Number(a.completed) - Number(b.completed))); };
  const remove = async (id: number) => { await del(`/api/tasks/${id}`); setTasks(p => p.filter(t => t.id !== id)); };
  return (
    <Card>
      <SectionTitle sub="What needs doing this week">✓ Checklist</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, maxHeight: 240, overflowY: 'auto' }}>
        {tasks.length === 0 && <Empty>Nothing yet — add a task below.</Empty>}
        {tasks.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: t.completed ? 0.5 : 1 }}>
            <Check checked={t.completed} onClick={() => toggle(t)} />
            <span style={{ flex: 1, fontSize: 14, textDecoration: t.completed ? 'line-through' : 'none' }}>{t.title}</span>
            <DeleteBtn onClick={() => remove(t.id)} />
          </div>
        ))}
      </div>
      <AddRow placeholder="Add a task…" onAdd={add} />
    </Card>
  );
}

// ── Gym ──
function GymCard({ week }: { week: string }) {
  const [sessions, setSessions] = useState<Gym[]>([]);
  const [day, setDay] = useState('Mon');
  const [focus, setFocus] = useState('');
  useEffect(() => { getJSON(`/api/gym?week=${week}`).then(setSessions); }, [week]);
  const add = async () => { if (!focus.trim()) return; const s = await postJSON('/api/gym', { week_start: week, day_label: day, focus }); setSessions(p => [...p, s]); setFocus(''); };
  const toggle = async (s: Gym) => { if (!s.completed) pop(); await patchJSON(`/api/gym/${s.id}`, { completed: !s.completed }); setSessions(p => p.map(x => x.id === s.id ? { ...x, completed: !x.completed } : x)); };
  const remove = async (id: number) => { await del(`/api/gym/${id}`); setSessions(p => p.filter(s => s.id !== id)); };
  const doneCount = sessions.filter(s => s.completed).length;
  return (
    <Card>
      <SectionTitle sub={`${doneCount} of ${sessions.length} sessions done`}><Dumbbell size={17} style={{ display: 'inline', verticalAlign: -3, marginRight: 6, color: 'var(--terra)' }} />Gym</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, maxHeight: 200, overflowY: 'auto' }}>
        {sessions.length === 0 && <Empty>Plan your training sessions.</Empty>}
        {sessions.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: s.completed ? 0.5 : 1 }}>
            <Check checked={s.completed} onClick={() => toggle(s)} color="var(--terra)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--terra)', width: 32 }}>{s.day_label}</span>
            <span style={{ flex: 1, fontSize: 14, textDecoration: s.completed ? 'line-through' : 'none' }}>{s.focus}</span>
            <DeleteBtn onClick={() => remove(s.id)} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <select value={day} onChange={e => setDay(e.target.value)} style={{ width: 90 }}>
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <option key={d}>{d}</option>)}
        </select>
        <input placeholder="e.g. Legs, Push, Run…" value={focus} onChange={e => setFocus(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <button onClick={add} style={{ background: 'var(--terra)', color: '#fff', border: 'none', borderRadius: 9, padding: '0 14px', flexShrink: 0 }}>+</button>
      </div>
    </Card>
  );
}

// ── Calorie counter ──
function CalorieCard() {
  const [logs, setLogs] = useState<Food[]>([]);
  const [food, setFood] = useState('');
  const [est, setEst] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const date = todayISO();
  useEffect(() => { getJSON(`/api/food?date=${date}`).then(setLogs); }, [date]);

  const estimate = async (text: string) => {
    if (!text.trim()) { setEst(null); return; }
    const r = await postJSON('/api/estimate-calories', { food: text });
    setEst(r.calories);
  };
  const onChange = (v: string) => { setFood(v); estimate(v); };
  const addLog = async () => {
    if (!food.trim()) return;
    setBusy(true);
    const r = await postJSON('/api/estimate-calories', { food });
    const log = await postJSON('/api/food', { log_date: date, food, calories: r.calories });
    setLogs(p => [...p, log]); setFood(''); setEst(null); setBusy(false);
  };
  const remove = async (id: number) => { await del(`/api/food/${id}`); setLogs(p => p.filter(f => f.id !== id)); };
  const total = logs.reduce((s, l) => s + l.calories, 0);
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <SectionTitle sub="Type what you ate today"><Flame size={17} style={{ display: 'inline', verticalAlign: -3, marginRight: 6, color: 'var(--rose)' }} />Calories</SectionTitle>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--serif)', color: 'var(--rose)', lineHeight: 1 }}>{total}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>kcal today</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12, maxHeight: 180, overflowY: 'auto' }}>
        {logs.length === 0 && <Empty>No meals logged today.</Empty>}
        {logs.map(l => (
          <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <span style={{ flex: 1 }}>{l.food}</span>
            <span style={{ fontWeight: 600, color: 'var(--rose)', fontSize: 13 }}>{l.calories} kcal</span>
            <DeleteBtn onClick={() => remove(l.id)} />
          </div>
        ))}
      </div>
      <input placeholder="e.g. 2 eggs and toast, latte" value={food} onChange={e => onChange(e.target.value)} onKeyDown={e => e.key === 'Enter' && addLog()} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{est !== null ? `≈ ${est} kcal estimated` : 'estimate appears as you type'}</span>
        <button onClick={addLog} disabled={busy || !food.trim()} style={{ background: food.trim() ? 'var(--rose)' : 'var(--line-strong)', color: '#fff', border: 'none', borderRadius: 9, padding: '7px 16px', fontWeight: 600, fontSize: 13 }}>Log it</button>
      </div>
    </Card>
  );
}

// ── Goal focus ──
function GoalsCard({ week }: { week: string }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  useEffect(() => { getJSON(`/api/weekly-goals?week=${week}`).then(setGoals); }, [week]);
  const add = async (goal: string) => { const r = await postJSON('/api/weekly-goals', { week_start: week, goal }); setGoals(p => [...p, r]); };
  const toggle = async (g: Goal) => { if (!g.completed) pop(); await patchJSON(`/api/weekly-goals/${g.id}`, { completed: !g.completed }); setGoals(p => p.map(x => x.id === g.id ? { ...x, completed: !x.completed } : x)); };
  const remove = async (id: number) => { await del(`/api/weekly-goals/${id}`); setGoals(p => p.filter(g => g.id !== id)); };
  return (
    <Card>
      <SectionTitle sub="The few things that matter most"><Target size={17} style={{ display: 'inline', verticalAlign: -3, marginRight: 6, color: 'var(--sage)' }} />Goal focus</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {goals.length === 0 && <Empty>Set your focus for the week.</Empty>}
        {goals.map(g => (
          <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: g.completed ? 0.5 : 1 }}>
            <Check checked={g.completed} onClick={() => toggle(g)} color="var(--sage)" />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, textDecoration: g.completed ? 'line-through' : 'none' }}>{g.goal}</span>
            <DeleteBtn onClick={() => remove(g.id)} />
          </div>
        ))}
      </div>
      <AddRow placeholder="A goal for this week…" onAdd={add} accent="var(--sage)" />
    </Card>
  );
}

// ── Reflections ──
function ReflectionCard({ week }: { week: string }) {
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(true);
  useEffect(() => { getJSON(`/api/weekly-reflection?week=${week}`).then(r => { setContent(r.content || ''); setSaved(true); }); }, [week]);
  useEffect(() => {
    if (saved) return;
    const t = setTimeout(() => { postJSON('/api/weekly-reflection', { week_start: week, content }).then(() => setSaved(true)); }, 800);
    return () => clearTimeout(t);
  }, [content, saved, week]);
  return (
    <Card>
      <SectionTitle sub="A few honest lines"><NotebookPen size={17} style={{ display: 'inline', verticalAlign: -3, marginRight: 6, color: 'var(--sky)' }} />Reflections</SectionTitle>
      <textarea value={content} onChange={e => { setContent(e.target.value); setSaved(false); }} placeholder="How did this week go? What did you learn?" style={{ minHeight: 120, resize: 'vertical', lineHeight: 1.6 }} />
      <p style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 6, textAlign: 'right' }}>{saved ? 'Saved' : 'Saving…'}</p>
    </Card>
  );
}

// ── Fun ideas ──
function IdeasCard() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  useEffect(() => { getJSON('/api/fun-ideas').then(setIdeas); }, []);
  const add = async (content: string) => { const r = await postJSON('/api/fun-ideas', { content }); setIdeas(p => [r, ...p]); };
  const toggle = async (i: Idea) => { if (!i.done) pop(); await patchJSON(`/api/fun-ideas/${i.id}`, { done: !i.done }); setIdeas(p => p.map(x => x.id === i.id ? { ...x, done: !x.done } : x)); };
  const remove = async (id: number) => { await del(`/api/fun-ideas/${id}`); setIdeas(p => p.filter(i => i.id !== id)); };
  return (
    <Card>
      <SectionTitle sub="Little joys & things to try"><Heart size={17} style={{ display: 'inline', verticalAlign: -3, marginRight: 6, color: 'var(--gold)' }} />Fun ideas</SectionTitle>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {ideas.length === 0 && <Empty>Pop in something fun to look forward to.</Empty>}
        {ideas.map(i => (
          <div key={i.id} onClick={() => toggle(i)} style={{ cursor: 'pointer', background: i.done ? 'var(--paper2)' : 'var(--gold-soft)', border: `1px solid ${i.done ? 'var(--line)' : 'var(--gold)'}66`, borderRadius: 20, padding: '6px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, opacity: i.done ? 0.5 : 1, textDecoration: i.done ? 'line-through' : 'none' }}>
            <Sparkles size={12} style={{ color: 'var(--gold)' }} />
            {i.content}
            <button onClick={e => { e.stopPropagation(); remove(i.id); }} style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', opacity: 0.5, padding: 0, marginLeft: 2 }}>×</button>
          </div>
        ))}
      </div>
      <AddRow placeholder="A fun idea…" onAdd={add} accent="var(--gold)" />
    </Card>
  );
}

export default function WeeklyView() {
  const [week, setWeek] = useState(mondayOf());
  const isThisWeek = week === mondayOf();
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={() => setWeek(w => shiftWeek(w, -1))} aria-label="Previous week" style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10, padding: 8, display: 'flex' }}><ChevronLeft size={18} /></button>
        <div style={{ textAlign: 'center', minWidth: 200 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{isThisWeek ? 'This week' : 'Week of'}</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600 }}>{weekLabel(week)}</div>
        </div>
        <button onClick={() => setWeek(w => shiftWeek(w, 1))} aria-label="Next week" style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10, padding: 8, display: 'flex' }}><ChevronRight size={18} /></button>
      </div>

      <div style={{ marginBottom: 16 }}><HabitGrid weekStart={week} /></div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <TasksCard week={week} />
        <GoalsCard week={week} />
        <GymCard week={week} />
        <CalorieCard />
        <ReflectionCard week={week} />
        <IdeasCard />
      </div>
    </div>
  );
}
