'use client';
import React, { useState, useEffect } from 'react';
import { Plane, Sparkles, Briefcase, Heart, Palette, PiggyBank, Plus } from 'lucide-react';
import { Card, Check, DeleteBtn, Empty } from './ui';
import { getJSON, postJSON, patchJSON, del, pop } from '@/lib/client';

type Item = { id: number; category: string; item: string; notes: string; completed: boolean };

const CATEGORIES = [
  { key: 'travel', label: 'Travel', icon: Plane, color: 'var(--sky)' },
  { key: 'experience', label: 'Experience', icon: Sparkles, color: 'var(--plum)' },
  { key: 'career', label: 'Career', icon: Briefcase, color: 'var(--ink-soft)' },
  { key: 'personal', label: 'Personal', icon: Heart, color: 'var(--rose)' },
  { key: 'creative', label: 'Creative', icon: Palette, color: 'var(--gold)' },
  { key: 'financial', label: 'Financial', icon: PiggyBank, color: 'var(--sage)' },
];

export default function BucketView() {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  useEffect(() => { getJSON('/api/bucket').then(setItems); }, []);

  const add = async (category: string) => {
    if (!draft.trim()) return;
    const r = await postJSON('/api/bucket', { category, item: draft });
    setItems(p => [...p, r]); setDraft(''); setActive(null);
  };
  const toggle = async (i: Item) => { if (!i.completed) pop(); await patchJSON(`/api/bucket/${i.id}`, { completed: !i.completed }); setItems(p => p.map(x => x.id === i.id ? { ...x, completed: !x.completed } : x)); };
  const remove = async (id: number) => { await del(`/api/bucket/${id}`); setItems(p => p.filter(i => i.id !== id)); };

  const total = items.length;
  const done = items.filter(i => i.completed).length;

  return (
    <div className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 700 }}>Bucket List</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{done} of {total} dreams ticked off</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {CATEGORIES.map(cat => {
          const list = items.filter(i => i.category === cat.key);
          const Icon = cat.icon;
          return (
            <Card key={cat.key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: cat.color + '1c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={17} style={{ color: cat.color }} /></span>
                <h3 style={{ fontSize: 17, fontWeight: 600 }}>{cat.label}</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
                {list.length === 0 && <Empty>Nothing here yet.</Empty>}
                {list.map(i => (
                  <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: i.completed ? 0.5 : 1 }}>
                    <Check checked={i.completed} onClick={() => toggle(i)} color={cat.color} />
                    <span style={{ flex: 1, fontSize: 14, textDecoration: i.completed ? 'line-through' : 'none' }}>{i.item}</span>
                    <DeleteBtn onClick={() => remove(i.id)} />
                  </div>
                ))}
              </div>
              {active === cat.key ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input autoFocus placeholder={`Add to ${cat.label.toLowerCase()}…`} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') add(cat.key); if (e.key === 'Escape') setActive(null); }} />
                  <button onClick={() => add(cat.key)} style={{ background: cat.color, color: '#fff', border: 'none', borderRadius: 9, padding: '0 14px', flexShrink: 0 }}>+</button>
                </div>
              ) : (
                <button onClick={() => { setActive(cat.key); setDraft(''); }} style={{ width: '100%', background: 'transparent', border: '1.5px dashed var(--line-strong)', borderRadius: 9, padding: 9, color: 'var(--ink-soft)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Plus size={14} /> Add</button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
