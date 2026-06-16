'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Inbox, PoundSterling, Target } from 'lucide-react';
import { Card, SectionTitle, AddRow, DeleteBtn, Check, Empty } from './ui';
import { getJSON, postJSON, patchJSON, del, currentQuarter, pop } from '@/lib/client';

type Fin = { id: number; label: string; amount: number; kind: string };
type QGoal = { id: number; goal: string; completed: boolean };
type Ach = { id: number; content: string; achieved_date: string };
type Park = { id: number; content: string };

function shiftQuarter(q: string, dir: number) {
  const [y, qq] = q.split('-Q').map(Number);
  let year = y, quarter = qq + dir;
  if (quarter < 1) { quarter = 4; year--; }
  if (quarter > 4) { quarter = 1; year++; }
  return `${year}-Q${quarter}`;
}

function FinancesCard({ quarter }: { quarter: string }) {
  const [items, setItems] = useState<Fin[]>([]);
  const [form, setForm] = useState({ label: '', amount: '', kind: 'expense' });
  useEffect(() => { getJSON(`/api/finances?quarter=${quarter}`).then(setItems); }, [quarter]);
  const add = async () => {
    if (!form.label.trim() || !form.amount) return;
    const r = await postJSON('/api/finances', { quarter, label: form.label, amount: parseFloat(form.amount), kind: form.kind });
    setItems(p => [...p, r]); setForm({ label: '', amount: '', kind: 'expense' });
  };
  const remove = async (id: number) => { await del(`/api/finances/${id}`); setItems(p => p.filter(i => i.id !== id)); };
  const income = items.filter(i => i.kind === 'income').reduce((s, i) => s + Number(i.amount), 0);
  const expense = items.filter(i => i.kind === 'expense').reduce((s, i) => s + Number(i.amount), 0);
  const saving = items.filter(i => i.kind === 'saving').reduce((s, i) => s + Number(i.amount), 0);
  const kindColor: Record<string, string> = { income: 'var(--sage)', expense: 'var(--rose)', saving: 'var(--sky)' };
  return (
    <Card>
      <SectionTitle sub="Track the bigger money picture"><PoundSterling size={17} style={{ display: 'inline', verticalAlign: -3, marginRight: 6, color: 'var(--sage)' }} />Finances</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
        {[['In', income, 'var(--sage)'], ['Out', expense, 'var(--rose)'], ['Saved', saving, 'var(--sky)']].map(([l, v, c]) => (
          <div key={l as string} style={{ background: 'var(--paper2)', borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{l as string}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: c as string }}>£{(v as number).toFixed(0)}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12, maxHeight: 180, overflowY: 'auto' }}>
        {items.length === 0 && <Empty>Add income, expenses or savings.</Empty>}
        {items.map(i => (
          <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: kindColor[i.kind] }} />
            <span style={{ flex: 1 }}>{i.label}</span>
            <span style={{ fontWeight: 600, color: kindColor[i.kind] }}>£{Number(i.amount).toFixed(0)}</span>
            <DeleteBtn onClick={() => remove(i.id)} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Label" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} style={{ flex: 2 }} />
        <input placeholder="£" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={{ flex: 1 }} />
        <select value={form.kind} onChange={e => setForm(f => ({ ...f, kind: e.target.value }))} style={{ flex: 1 }}>
          <option value="expense">Out</option><option value="income">In</option><option value="saving">Save</option>
        </select>
        <button onClick={add} style={{ background: 'var(--sage)', color: '#fff', border: 'none', borderRadius: 9, padding: '0 14px', flexShrink: 0 }}>+</button>
      </div>
    </Card>
  );
}

function QGoalsCard({ quarter }: { quarter: string }) {
  const [goals, setGoals] = useState<QGoal[]>([]);
  useEffect(() => { getJSON(`/api/quarterly-goals?quarter=${quarter}`).then(setGoals); }, [quarter]);
  const add = async (goal: string) => { const r = await postJSON('/api/quarterly-goals', { quarter, goal }); setGoals(p => [...p, r]); };
  const toggle = async (g: QGoal) => { if (!g.completed) pop(); await patchJSON(`/api/quarterly-goals/${g.id}`, { completed: !g.completed }); setGoals(p => p.map(x => x.id === g.id ? { ...x, completed: !x.completed } : x)); };
  const remove = async (id: number) => { await del(`/api/quarterly-goals/${id}`); setGoals(p => p.filter(g => g.id !== id)); };
  const done = goals.filter(g => g.completed).length;
  return (
    <Card>
      <SectionTitle sub={`${done} of ${goals.length} achieved`}><Target size={17} style={{ display: 'inline', verticalAlign: -3, marginRight: 6, color: 'var(--plum)' }} />Quarterly goals</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {goals.length === 0 && <Empty>What do you want to achieve this quarter?</Empty>}
        {goals.map(g => (
          <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: g.completed ? 0.5 : 1 }}>
            <Check checked={g.completed} onClick={() => toggle(g)} color="var(--plum)" />
            <span style={{ flex: 1, fontSize: 14, textDecoration: g.completed ? 'line-through' : 'none' }}>{g.goal}</span>
            <DeleteBtn onClick={() => remove(g.id)} />
          </div>
        ))}
      </div>
      <AddRow placeholder="A goal for this quarter…" onAdd={add} />
    </Card>
  );
}

function AchievementsCard({ quarter }: { quarter: string }) {
  const [items, setItems] = useState<Ach[]>([]);
  useEffect(() => { getJSON('/api/achievements').then(setItems); }, []);
  const add = async (content: string) => { const r = await postJSON('/api/achievements', { quarter, content }); setItems(p => [r, ...p]); pop(); };
  const remove = async (id: number) => { await del(`/api/achievements/${id}`); setItems(p => p.filter(i => i.id !== id)); };
  return (
    <Card>
      <SectionTitle sub="Wins worth remembering"><Trophy size={17} style={{ display: 'inline', verticalAlign: -3, marginRight: 6, color: 'var(--gold)' }} />Achievements</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, maxHeight: 200, overflowY: 'auto' }}>
        {items.length === 0 && <Empty>Log something you&apos;re proud of.</Empty>}
        {items.map(i => (
          <div key={i.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'var(--gold-soft)', borderRadius: 9, padding: '8px 10px' }}>
            <Trophy size={14} style={{ color: 'var(--gold)', marginTop: 2, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 14 }}>{i.content}</span>
            <DeleteBtn onClick={() => remove(i.id)} />
          </div>
        ))}
      </div>
      <AddRow placeholder="I achieved…" onAdd={add} accent="var(--gold)" />
    </Card>
  );
}

function ParkingCard() {
  const [items, setItems] = useState<Park[]>([]);
  useEffect(() => { getJSON('/api/parking-lot').then(setItems); }, []);
  const add = async (content: string) => { const r = await postJSON('/api/parking-lot', { content }); setItems(p => [r, ...p]); };
  const remove = async (id: number) => { await del(`/api/parking-lot/${id}`); setItems(p => p.filter(i => i.id !== id)); };
  return (
    <Card>
      <SectionTitle sub="Ideas to revisit later"><Inbox size={17} style={{ display: 'inline', verticalAlign: -3, marginRight: 6, color: 'var(--sky)' }} />Parking lot</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, maxHeight: 200, overflowY: 'auto' }}>
        {items.length === 0 && <Empty>Park an idea here for another day.</Empty>}
        {items.map(i => (
          <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, borderLeft: '3px solid var(--sky)', paddingLeft: 10 }}>
            <span style={{ flex: 1 }}>{i.content}</span>
            <DeleteBtn onClick={() => remove(i.id)} />
          </div>
        ))}
      </div>
      <AddRow placeholder="Something to come back to…" onAdd={add} accent="var(--sky)" />
    </Card>
  );
}

export default function QuarterlyView() {
  const [quarter, setQuarter] = useState(currentQuarter());
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={() => setQuarter(q => shiftQuarter(q, -1))} aria-label="Previous quarter" style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10, padding: 8, display: 'flex' }}><ChevronLeft size={18} /></button>
        <div style={{ textAlign: 'center', minWidth: 160 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>The bigger picture</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600 }}>{quarter.replace('-', ' · ')}</div>
        </div>
        <button onClick={() => setQuarter(q => shiftQuarter(q, 1))} aria-label="Next quarter" style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10, padding: 8, display: 'flex' }}><ChevronRight size={18} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <QGoalsCard quarter={quarter} />
        <FinancesCard quarter={quarter} />
        <AchievementsCard quarter={quarter} />
        <ParkingCard />
      </div>
    </div>
  );
}
