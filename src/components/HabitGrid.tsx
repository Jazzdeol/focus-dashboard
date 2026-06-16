'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Card } from './ui';
import { getJSON, postJSON, del, weekDays, pop } from '@/lib/client';

type Habit = { id: number; name: string; icon: string; color: string; section: string; weekly_goal: number };
type Log = { habit_id: number; logged_date: string };

const EMOJIS = ['✨','💪','🧘','📚','💧','🏃','🥗','😴','🎯','🧠','✍️','🌿','🙏','📖','🕊️','☀️','🌙','❤️','🎨','🎵','💊','🚶','🧴','📵'];
const COLORS = ['#7c5cbf','#d6608a','#5f8d6a','#c79a3a','#5685b5','#c46a44','#9b59b6','#16a085'];

export default function HabitGrid({ weekStart }: { weekStart: string }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '✨', color: '#7c5cbf', section: 'daily', weekly_goal: 7 });
  const days = weekDays(weekStart);

  const load = useCallback(() => {
    getJSON('/api/habits').then(d => { setHabits(d.habits); setLogs(d.logs); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const isLogged = (hid: number, iso: string) => logs.some(l => l.habit_id === hid && l.logged_date.startsWith(iso));

  const toggle = async (hid: number, iso: string) => {
    const wasLogged = isLogged(hid, iso);
    const res = await postJSON('/api/habits/log', { habit_id: hid, date: iso });
    if (res.logged) { setLogs(p => [...p, { habit_id: hid, logged_date: iso }]); if (!wasLogged) pop(); }
    else setLogs(p => p.filter(l => !(l.habit_id === hid && l.logged_date.startsWith(iso))));
  };

  const add = async () => {
    if (!form.name.trim()) return;
    const h = await postJSON('/api/habits', form);
    setHabits(p => [...p, h]);
    setForm({ name: '', icon: '✨', color: '#7c5cbf', section: 'daily', weekly_goal: 7 });
    setAdding(false);
  };

  const remove = async (id: number) => { await del(`/api/habits/${id}`); setHabits(p => p.filter(h => h.id !== id)); };

  const weekCount = (hid: number) => days.filter(d => isLogged(hid, d.iso)).length;

  // overall completion across the week
  const totalGoal = habits.reduce((s, h) => s + Math.min(h.weekly_goal, 7), 0);
  const totalDone = habits.reduce((s, h) => s + Math.min(weekCount(h.id), h.weekly_goal), 0);
  const overallPct = totalGoal ? Math.round((totalDone / totalGoal) * 100) : 0;

  const renderSection = (section: string, title: string) => {
    const list = habits.filter(h => h.section === section);
    if (!list.length) return null;
    return (
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 8 }}>{title}</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '4px 8px', fontSize: 12, fontWeight: 500, color: 'var(--ink-soft)' }}></th>
                {days.map(d => (
                  <th key={d.iso} style={{ padding: '4px 0', fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', width: 34 }}>{d.short[0]}</th>
                ))}
                <th style={{ padding: '4px 6px', fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)' }}>Goal</th>
              </tr>
            </thead>
            <tbody>
              {list.map(h => {
                const count = weekCount(h.id);
                const hit = count >= h.weekly_goal;
                return (
                  <tr key={h.id} className="habit-row">
                    <td style={{ padding: '6px 8px', fontSize: 13, whiteSpace: 'nowrap' }}>
                      <span style={{ marginRight: 6 }}>{h.icon}</span>{h.name}
                      <button onClick={() => remove(h.id)} aria-label="Remove habit" style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', opacity: 0.35, marginLeft: 6, padding: 0, verticalAlign: 'middle' }}><Trash2 size={12} /></button>
                    </td>
                    {days.map(d => {
                      const on = isLogged(h.id, d.iso);
                      return (
                        <td key={d.iso} style={{ textAlign: 'center', padding: '3px 0' }}>
                          <button onClick={() => toggle(h.id, d.iso)} aria-label={`${h.name} ${d.label}`} style={{
                            width: 26, height: 26, borderRadius: 8,
                            border: `1.5px solid ${on ? h.color : 'var(--line-strong)'}`,
                            background: on ? h.color : 'transparent', display: 'inline-flex',
                            alignItems: 'center', justifyContent: 'center', color: '#fff',
                          }}>
                            {on && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          </button>
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center', padding: '3px 6px', fontSize: 12, fontWeight: 600, color: hit ? h.color : 'var(--ink-soft)' }}>
                      {count}/{h.weekly_goal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 19, fontWeight: 600 }}>Habit Tracker</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>This week&apos;s rhythm</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 30, fontWeight: 700, fontFamily: 'var(--serif)', color: 'var(--plum)', lineHeight: 1 }}>{overallPct}%</div>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>overall</div>
        </div>
      </div>

      {/* progress bar */}
      <div style={{ height: 8, background: 'var(--paper2)', borderRadius: 4, overflow: 'hidden', marginBottom: 18 }}>
        <div style={{ width: `${overallPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--plum), var(--rose))', borderRadius: 4, transition: 'width 0.4s' }} />
      </div>

      {renderSection('daily', 'Daily')}
      {renderSection('devotional', 'Devotional')}

      {habits.length === 0 && !adding && <p style={{ color: 'var(--ink-soft)', fontSize: 13, fontStyle: 'italic', textAlign: 'center', padding: 12 }}>Add your first habit to start tracking.</p>}

      {/* summary cards */}
      {habits.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginTop: 8 }}>
          {habits.map(h => {
            const count = weekCount(h.id);
            const pct = Math.round((count / h.weekly_goal) * 100);
            return (
              <div key={h.id} style={{ background: h.color + '14', border: `1px solid ${h.color}44`, borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}><span>{h.icon}</span>{h.name}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: h.color, marginTop: 2 }}>{pct}%</div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{count} of {h.weekly_goal} days</div>
              </div>
            );
          })}
        </div>
      )}

      {/* add habit */}
      {adding ? (
        <div style={{ marginTop: 16, padding: 14, background: 'var(--paper2)', borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>New habit</span>
            <button onClick={() => setAdding(false)} style={{ background: 'none', border: 'none', color: 'var(--ink-soft)' }}><X size={16} /></button>
          </div>
          <input placeholder="Habit name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus style={{ marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <select value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} style={{ flex: 1 }}>
              <option value="daily">Daily</option>
              <option value="devotional">Devotional</option>
            </select>
            <select value={form.weekly_goal} onChange={e => setForm(f => ({ ...f, weekly_goal: parseInt(e.target.value) }))} style={{ flex: 1 }}>
              {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} / 7 days</option>)}
            </select>
          </div>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 6, fontWeight: 600 }}>ICON</p>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setForm(f => ({ ...f, icon: e }))} style={{ background: form.icon === e ? 'var(--plum-soft)' : 'var(--card)', border: `1px solid ${form.icon === e ? 'var(--plum)' : 'var(--line)'}`, borderRadius: 7, padding: '3px 6px', fontSize: 15 }}>{e}</button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 6, fontWeight: 600 }}>COLOUR</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: `2px solid ${form.color === c ? 'var(--ink)' : 'transparent'}` }} />
            ))}
          </div>
          <button onClick={add} style={{ width: '100%', background: 'var(--plum)', color: '#fff', border: 'none', borderRadius: 9, padding: '10px', fontWeight: 600, fontSize: 14 }}>Add habit</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ marginTop: 14, width: '100%', background: 'transparent', border: '1.5px dashed var(--line-strong)', borderRadius: 10, padding: '10px', color: 'var(--ink-soft)', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Plus size={15} /> Add habit
        </button>
      )}
    </Card>
  );
}
