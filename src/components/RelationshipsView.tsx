'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Cake, Clock, Check, X, Heart } from 'lucide-react';
import { Card, SectionTitle, Empty } from './ui';
import { getJSON, postJSON, patchJSON, del, pop, todayISO } from '@/lib/client';

type Person = { id: number; name: string; birthday: string | null; cadence_days: number; last_caught_up: string | null; notes: string };

const CADENCE = [
  { d: 7, label: 'Weekly' }, { d: 14, label: 'Every 2 weeks' }, { d: 30, label: 'Monthly' },
  { d: 90, label: 'Every 3 months' }, { d: 180, label: 'Every 6 months' },
];
const addDays = (iso: string, days: number) => { const d = new Date(iso); d.setDate(d.getDate() + days); return d; };
const daysUntilBirthday = (bday: string) => {
  const today = new Date(); const b = new Date(bday); const next = new Date(today.getFullYear(), b.getMonth(), b.getDate());
  if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) next.setFullYear(today.getFullYear() + 1);
  return Math.round((next.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86400000);
};

export default function RelationshipsView() {
  const [people, setPeople] = useState<Person[]>([]);
  const [form, setForm] = useState({ name: '', birthday: '', cadence_days: 30 });
  useEffect(() => { getJSON('/api/relationships').then(setPeople); }, []);

  const add = async () => {
    if (!form.name.trim()) return;
    const p = await postJSON('/api/relationships', { ...form, birthday: form.birthday || null });
    setPeople(prev => [...prev, p]); setForm({ name: '', birthday: '', cadence_days: form.cadence_days });
  };
  const caughtUp = async (p: Person) => { pop(); const r = await patchJSON(`/api/relationships/${p.id}`, { caught_up: true }); setPeople(prev => prev.map(x => x.id === p.id ? r : x)); };
  const remove = async (id: number) => { await del(`/api/relationships/${id}`); setPeople(prev => prev.filter(p => p.id !== id)); };

  const today = todayISO();
  const status = (p: Person) => {
    const due = p.last_caught_up ? addDays(p.last_caught_up, p.cadence_days) : new Date(today);
    const diff = Math.round((due.getTime() - new Date(today).getTime()) / 86400000);
    if (diff <= 0) return { label: p.last_caught_up ? 'Time to catch up' : 'Reach out', overdue: true };
    return { label: `In ${diff} day${diff === 1 ? '' : 's'}`, overdue: false };
  };
  const sorted = [...people].sort((a, b) => Number(status(b).overdue) - Number(status(a).overdue));

  return (
    <div className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 700 }}>Your people</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>stay close to the ones who matter</p>
      </div>

      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <Card style={{ marginBottom: 16 }}>
          <SectionTitle><Heart size={16} style={{ display: 'inline', verticalAlign: -2, marginRight: 6, color: 'var(--rose)' }} />Add someone</SectionTitle>
          <input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Birthday (optional)</label>
              <input type="date" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Catch up</label>
              <select value={form.cadence_days} onChange={e => setForm(f => ({ ...f, cadence_days: parseInt(e.target.value) }))}>
                {CADENCE.map(c => <option key={c.d} value={c.d}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <button onClick={add} style={{ width: '100%', background: 'var(--rose)', color: '#fff', border: 'none', borderRadius: 9, padding: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Plus size={16} /> Add person</button>
        </Card>

        {people.length === 0 ? <Empty>Add the people you want to keep in touch with.</Empty> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sorted.map(p => {
              const st = status(p);
              const bd = p.birthday ? daysUntilBirthday(p.birthday) : null;
              return (
                <Card key={p.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--rose-soft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, fontFamily: 'var(--serif)', flexShrink: 0 }}>{p.name.charAt(0).toUpperCase()}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{p.name}</div>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, marginTop: 2 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: st.overdue ? 'var(--terra)' : 'var(--ink-soft)', fontWeight: st.overdue ? 600 : 400 }}>
                          <Clock size={12} /> {st.label}
                        </span>
                        {bd !== null && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: bd <= 14 ? 'var(--gold)' : 'var(--ink-soft)', fontWeight: bd <= 14 ? 600 : 400 }}>
                            <Cake size={12} /> {bd === 0 ? 'Birthday today! 🎉' : `Birthday in ${bd}d`}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => caughtUp(p)} title="Mark caught up today" style={{ background: 'var(--sage)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 11px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}><Check size={13} /> Caught up</button>
                    <button onClick={() => remove(p.id)} aria-label="Remove" style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', opacity: 0.5, flexShrink: 0 }}><X size={15} /></button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
