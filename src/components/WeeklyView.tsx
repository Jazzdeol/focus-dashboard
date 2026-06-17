'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell, Flame, Target, Sparkles, Heart, NotebookPen, Moon, Calculator, Plus } from 'lucide-react';
import { Card, SectionTitle, AddRow, DeleteBtn, Check, Empty } from './ui';
import HabitGrid from './HabitGrid';
import { getJSON, postJSON, patchJSON, del, mondayOf, todayISO, weekDays, pop } from '@/lib/client';

type Task = { id: number; title: string; completed: boolean };
type Food = { id: number; food: string; calories: number; protein: number };
type Goal = { id: number; goal: string; completed: boolean };
type Idea = { id: number; content: string; done: boolean };
type Exercise = { id: number; name: string };
type GymLog = { exercise_id: number; week_start: string; weight: number; reps: number | null; sets: number | null };
type Profile = { weight: number; height: number; age: number; sex: string; activity: string } | null;

function shiftWeek(weekStart: string, dir: number) {
  const [y, m, d] = weekStart.split('-').map(Number);
  const dt = new Date(y, m - 1, d); dt.setDate(dt.getDate() + dir * 7);
  return mondayOf(dt);
}
function weekLabel(weekStart: string) {
  const [y, m, d] = weekStart.split('-').map(Number);
  const start = new Date(y, m - 1, d);
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

// ── Nutrition targets (calorie calculator) ──
const ACTIVITY: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very: 1.9 };
const ACTIVITY_LABEL: Record<string, string> = { sedentary: 'Barely active', light: 'Lightly active', moderate: 'Moderately active', active: 'Very active', very: 'Athlete' };

function calcTargets(p: Profile) {
  if (!p || !p.weight || !p.height || !p.age) return null;
  const w = Number(p.weight), h = Number(p.height), a = Number(p.age);
  let bmr = 10 * w + 6.25 * h - 5 * a;
  bmr += p.sex === 'male' ? 5 : p.sex === 'female' ? -161 : -78;
  const maintenance = Math.round(bmr * (ACTIVITY[p.activity] || 1.55));
  const bulk = maintenance + 400; // lean gain ~0.35 kg/week
  const weeksTo10kg = Math.round((10 * 7700) / (400 * 7));
  return { maintenance, bulk, weeksTo10kg };
}

function NutritionCard({ onProfile }: { onProfile: (p: Profile) => void }) {
  const [form, setForm] = useState({ weight: '', height: '', age: '', sex: 'female', activity: 'moderate' });
  const [saved, setSaved] = useState<Profile>(null);
  useEffect(() => { getJSON('/api/profile').then((p: Profile) => { if (p) { setForm({ weight: String(p.weight ?? ''), height: String(p.height ?? ''), age: String(p.age ?? ''), sex: p.sex || 'female', activity: p.activity || 'moderate' }); setSaved(p); onProfile(p); } }); }, [onProfile]);
  const save = async () => {
    const body = { weight: parseFloat(form.weight), height: parseFloat(form.height), age: parseInt(form.age), sex: form.sex, activity: form.activity };
    const p = await postJSON('/api/profile', body); setSaved(p); onProfile(p); pop();
  };
  const t = calcTargets(saved);
  return (
    <Card>
      <SectionTitle sub="Work out your calories to maintain or gain"><Calculator size={17} style={{ display: 'inline', verticalAlign: -3, marginRight: 6, color: 'var(--plum)' }} />Calorie calculator</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <input placeholder="Weight (kg)" type="number" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
        <input placeholder="Height (cm)" type="number" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} />
        <input placeholder="Age" type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
        <select value={form.sex} onChange={e => setForm(f => ({ ...f, sex: e.target.value }))}>
          <option value="female">Female</option><option value="male">Male</option><option value="other">Prefer not to say</option>
        </select>
        <select value={form.activity} onChange={e => setForm(f => ({ ...f, activity: e.target.value }))} style={{ gridColumn: '1 / span 2' }}>
          {Object.keys(ACTIVITY).map(k => <option key={k} value={k}>{ACTIVITY_LABEL[k]}</option>)}
        </select>
      </div>
      <button onClick={save} style={{ width: '100%', background: 'var(--plum)', color: '#fff', border: 'none', borderRadius: 9, padding: 10, fontWeight: 600, fontSize: 14, marginBottom: t ? 14 : 0 }}>Calculate</button>
      {t && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, background: 'var(--sage-soft)', borderRadius: 11, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>To maintain</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--sage)' }}>{t.maintenance}<span style={{ fontSize: 12, fontWeight: 400 }}> kcal/day</span></div>
            </div>
            <div style={{ flex: 1, background: 'var(--gold-soft)', borderRadius: 11, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>To gain weight</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--gold)' }}>{t.bulk}<span style={{ fontSize: 12, fontWeight: 400 }}> kcal/day</span></div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
            Eating about <strong>{t.bulk} kcal</strong> a day (a ~400 surplus) puts on roughly <strong>0.35 kg/week</strong>. At that pace, +10 kg takes around <strong>{t.weeksTo10kg} weeks</strong>. Pair it with the gym tracker below and aim for plenty of protein.
          </p>
        </div>
      )}
    </Card>
  );
}

// ── Calorie + protein counter with per-day saving ──
function CalorieCard({ week, target }: { week: string; target: number | null }) {
  const days = weekDays(week);
  const today = todayISO();
  const initialDay = days.find(d => d.iso === today)?.iso || days[0].iso;
  const [day, setDay] = useState(initialDay);
  const [logs, setLogs] = useState<Food[]>([]);
  const [food, setFood] = useState('');
  const [est, setEst] = useState<{ calories: number; protein: number } | null>(null);
  useEffect(() => { setDay(days.find(d => d.iso === todayISO())?.iso || days[0].iso); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [week]);
  useEffect(() => { getJSON(`/api/food?date=${day}`).then(setLogs); }, [day]);

  const onChange = async (v: string) => {
    setFood(v);
    if (!v.trim()) { setEst(null); return; }
    const r = await postJSON('/api/estimate-calories', { food: v });
    setEst({ calories: r.calories, protein: r.protein });
  };
  const addLog = async () => {
    if (!food.trim()) return;
    const r = await postJSON('/api/estimate-calories', { food });
    const log = await postJSON('/api/food', { log_date: day, food, calories: r.calories, protein: r.protein });
    setLogs(p => [...p, log]); setFood(''); setEst(null);
  };
  const remove = async (id: number) => { await del(`/api/food/${id}`); setLogs(p => p.filter(f => f.id !== id)); };
  const totalKcal = logs.reduce((s, l) => s + l.calories, 0);
  const totalP = logs.reduce((s, l) => s + (l.protein || 0), 0);
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <SectionTitle sub="Type what you ate — pick any day"><Flame size={17} style={{ display: 'inline', verticalAlign: -3, marginRight: 6, color: 'var(--rose)' }} />Food diary</SectionTitle>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--serif)', color: 'var(--rose)', lineHeight: 1 }}>{totalKcal}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>kcal{target ? ` / ${target}` : ''}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sky)', marginTop: 4 }}>{totalP}g protein</div>
        </div>
      </div>
      {/* day selector */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {days.map(d => (
          <button key={d.iso} onClick={() => setDay(d.iso)} style={{
            flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 12, fontWeight: d.iso === day ? 700 : 400,
            border: `1px solid ${d.iso === day ? 'var(--rose)' : 'var(--line)'}`,
            background: d.iso === day ? 'var(--rose-soft)' : 'transparent',
            color: d.iso === day ? 'var(--rose)' : 'var(--ink-soft)',
          }}>{d.short[0]}</button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12, maxHeight: 170, overflowY: 'auto' }}>
        {logs.length === 0 && <Empty>Nothing logged for this day.</Empty>}
        {logs.map(l => (
          <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <span style={{ flex: 1 }}>{l.food}</span>
            <span style={{ fontWeight: 600, color: 'var(--rose)', fontSize: 12 }}>{l.calories}kcal</span>
            <span style={{ fontWeight: 600, color: 'var(--sky)', fontSize: 12 }}>{l.protein || 0}g</span>
            <DeleteBtn onClick={() => remove(l.id)} />
          </div>
        ))}
      </div>
      <input placeholder="e.g. 2 eggs and toast, 200g chicken" value={food} onChange={e => onChange(e.target.value)} onKeyDown={e => e.key === 'Enter' && addLog()} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{est ? `≈ ${est.calories} kcal · ${est.protein}g protein` : 'estimate appears as you type'}</span>
        <button onClick={addLog} disabled={!food.trim()} style={{ background: food.trim() ? 'var(--rose)' : 'var(--line-strong)', color: '#fff', border: 'none', borderRadius: 9, padding: '7px 16px', fontWeight: 600, fontSize: 13 }}>Log it</button>
      </div>
    </Card>
  );
}

// ── Gym: exercises + per-week weight, last week shown in colour ──
function GymCard({ week }: { week: string }) {
  const prevWeek = shiftWeek(week, -1);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [logs, setLogs] = useState<GymLog[]>([]);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [newName, setNewName] = useState('');

  const loadLogs = () => getJSON(`/api/gym-logs?week=${week}&prev=${prevWeek}`).then(setLogs);
  useEffect(() => { getJSON('/api/gym-exercises').then(setExercises); }, []);
  useEffect(() => { loadLogs(); setDrafts({}); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [week]);

  const thisWeek = (id: number) => logs.find(l => l.exercise_id === id && l.week_start.startsWith(week));
  const lastWeek = (id: number) => logs.find(l => l.exercise_id === id && l.week_start.startsWith(prevWeek));

  const addExercise = async () => {
    if (!newName.trim()) return;
    const e = await postJSON('/api/gym-exercises', { name: newName.trim() });
    setExercises(p => [...p, e]); setNewName('');
  };
  const removeExercise = async (id: number) => { await del(`/api/gym-exercises/${id}`); setExercises(p => p.filter(e => e.id !== id)); };
  const saveWeight = async (id: number) => {
    const val = parseFloat(drafts[id]);
    if (isNaN(val)) return;
    const log = await postJSON('/api/gym-logs', { exercise_id: id, week_start: week, weight: val });
    setLogs(p => [...p.filter(l => !(l.exercise_id === id && l.week_start.startsWith(week))), log]);
    setDrafts(d => ({ ...d, [id]: '' })); pop();
  };

  return (
    <Card>
      <SectionTitle sub="Log your weights — last week shows in gold"><Dumbbell size={17} style={{ display: 'inline', verticalAlign: -3, marginRight: 6, color: 'var(--terra)' }} />Gym</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {exercises.length === 0 && <Empty>Add an exercise to start logging weights.</Empty>}
        {exercises.map(ex => {
          const tw = thisWeek(ex.id); const lw = lastWeek(ex.id);
          const beat = tw && lw && Number(tw.weight) > Number(lw.weight);
          return (
            <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--paper2)', borderRadius: 10, padding: '8px 10px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {ex.name}
                  <button onClick={() => removeExercise(ex.id)} aria-label="Remove" style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', opacity: 0.4, padding: 0 }}>×</button>
                </div>
                {lw && <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, marginTop: 2 }}>last week: {Number(lw.weight)}kg</div>}
              </div>
              {tw ? (
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: beat ? 'var(--sage)' : 'var(--terra)' }}>{Number(tw.weight)}kg</span>
                  {beat && <span style={{ fontSize: 11, color: 'var(--sage)', display: 'block' }}>up! ↑</span>}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 4 }}>
                  <input type="number" placeholder={lw ? `>${Number(lw.weight)}` : 'kg'} value={drafts[ex.id] || ''} onChange={e => setDrafts(d => ({ ...d, [ex.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && saveWeight(ex.id)} style={{ width: 64, padding: '6px 8px' }} />
                  <button onClick={() => saveWeight(ex.id)} style={{ background: 'var(--terra)', color: '#fff', border: 'none', borderRadius: 8, padding: '0 10px', fontSize: 13 }}>✓</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Add exercise (e.g. Squat)" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addExercise()} />
        <button onClick={addExercise} style={{ background: 'var(--terra)', color: '#fff', border: 'none', borderRadius: 9, padding: '0 14px', flexShrink: 0, display: 'flex', alignItems: 'center' }}><Plus size={16} /></button>
      </div>
    </Card>
  );
}

// ── Sleep ──
function SleepCard() {
  const today = todayISO();
  const [recent, setRecent] = useState<{ log_date: string; hours: number | null; bedtime: string | null; wake_time: string | null }[]>([]);
  const [bedtime, setBedtime] = useState('');
  const [wake, setWake] = useState('');
  const load = () => getJSON('/api/sleep').then(setRecent);
  useEffect(() => { load(); }, []);

  const calcHours = (bt: string, wt: string) => {
    if (!bt || !wt) return null;
    const [bh, bm] = bt.split(':').map(Number); const [wh, wm] = wt.split(':').map(Number);
    let mins = (wh * 60 + wm) - (bh * 60 + bm);
    if (mins <= 0) mins += 24 * 60; // crossed midnight
    return Math.round((mins / 60) * 10) / 10;
  };
  const checkIn = async (which: 'bed' | 'wake') => {
    if (which === 'bed') { if (!bedtime) return; await postJSON('/api/sleep', { log_date: today, bedtime }); }
    else {
      if (!wake) return;
      const existing = recent.find(r => r.log_date.startsWith(today));
      const hours = calcHours(existing?.bedtime || bedtime, wake);
      await postJSON('/api/sleep', { log_date: today, wake_time: wake, hours }); pop();
    }
    load();
  };

  const valid = recent.filter(r => r.hours != null);
  const avg = valid.length ? Math.round((valid.reduce((s, r) => s + Number(r.hours), 0) / valid.length) * 10) / 10 : null;
  const insights: string[] = [];
  if (avg != null) {
    if (avg < 6.5) insights.push(`You're averaging ${avg}h — that's on the short side. Aim for 7–9h; an earlier bedtime even 2–3 nights helps most.`);
    else if (avg > 9.5) insights.push(`You're averaging ${avg}h, which is quite long — fine now and then, but consistently oversleeping can leave you groggy.`);
    else insights.push(`Averaging ${avg}h — right in the healthy 7–9h range. Nice work keeping it steady.`);
    const bedtimes = valid.map(r => r.bedtime).filter(Boolean) as string[];
    if (bedtimes.length >= 3) {
      const mins = bedtimes.map(b => { const [h, m] = b.split(':').map(Number); return (h < 12 ? h + 24 : h) * 60 + m; });
      const spread = Math.max(...mins) - Math.min(...mins);
      if (spread > 90) insights.push('Your bedtimes vary by more than 1.5 hours — a more regular sleep window would steady your energy.');
    }
  }

  return (
    <Card>
      <SectionTitle sub="Check in at night and when you wake"><Moon size={17} style={{ display: 'inline', verticalAlign: -3, marginRight: 6, color: 'var(--plum)' }} />Sleep</SectionTitle>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 600 }}>BEDTIME</label>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)} />
            <button onClick={() => checkIn('bed')} style={{ background: 'var(--plum)', color: '#fff', border: 'none', borderRadius: 8, padding: '0 10px', fontSize: 12 }}>✓</button>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 600 }}>WOKE UP</label>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <input type="time" value={wake} onChange={e => setWake(e.target.value)} />
            <button onClick={() => checkIn('wake')} style={{ background: 'var(--plum)', color: '#fff', border: 'none', borderRadius: 8, padding: '0 10px', fontSize: 12 }}>✓</button>
          </div>
        </div>
      </div>
      {avg != null && (
        <div style={{ background: 'var(--plum-soft)', borderRadius: 11, padding: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--plum)', marginBottom: 4 }}>Your sleep, looked at</div>
          {insights.map((t, i) => <p key={i} style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 4 }}>{t}</p>)}
        </div>
      )}
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 44 }}>
        {recent.slice(0, 7).reverse().map((r, i) => {
          const h = r.hours ? Number(r.hours) : 0;
          return <div key={i} title={`${h}h`} style={{ flex: 1, background: h >= 7 && h <= 9 ? 'var(--sage)' : h ? 'var(--gold)' : 'var(--line)', height: `${Math.max(8, (h / 10) * 44)}px`, borderRadius: 3 }} />;
        })}
      </div>
      <p style={{ fontSize: 11, color: 'var(--ink-soft)', textAlign: 'center', marginTop: 4 }}>last 7 nights</p>
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
  const [profile, setProfile] = useState<Profile>(null);
  const isThisWeek = week === mondayOf();
  const targets = calcTargets(profile);
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
        <CalorieCard week={week} target={targets ? targets.bulk : null} />
        <NutritionCard onProfile={setProfile} />
        <SleepCard />
        <ReflectionCard week={week} />
        <IdeasCard />
      </div>
    </div>
  );
}
