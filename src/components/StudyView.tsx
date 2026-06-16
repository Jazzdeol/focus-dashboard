'use client';
import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Eye, RefreshCw, ExternalLink, Plus } from 'lucide-react';
import { Card, SectionTitle, Check, DeleteBtn, Empty } from './ui';
import { getJSON, postJSON, patchJSON, del, pop } from '@/lib/client';

type StudyItem = { id: number; subject: string; title: string; task_type: string; completed: boolean; notion_url?: string };
type NotionItem = { id: string; title: string; status: string; done: boolean; url: string };

const TYPES = [
  { key: 'notes', label: 'Make notes', icon: FileText, color: 'var(--plum)' },
  { key: 'read', label: 'Read', icon: BookOpen, color: 'var(--sky)' },
  { key: 'revise', label: 'Revise', icon: Eye, color: 'var(--gold)' },
];

export default function StudyView() {
  const [items, setItems] = useState<StudyItem[]>([]);
  const [form, setForm] = useState({ subject: '', title: '', task_type: 'notes' });
  const [notion, setNotion] = useState<{ configured: boolean; items: NotionItem[] }>({ configured: false, items: [] });
  const [notionLoading, setNotionLoading] = useState(true);

  useEffect(() => { getJSON('/api/study').then(setItems); }, []);
  useEffect(() => { getJSON('/api/notion-study').then(d => { setNotion(d); setNotionLoading(false); }).catch(() => setNotionLoading(false)); }, []);

  const add = async () => {
    if (!form.subject.trim() || !form.title.trim()) return;
    const r = await postJSON('/api/study', form);
    setItems(p => [...p, r]); setForm({ subject: form.subject, title: '', task_type: form.task_type });
  };
  const toggle = async (i: StudyItem) => { if (!i.completed) pop(); await patchJSON(`/api/study/${i.id}`, { completed: !i.completed }); setItems(p => p.map(x => x.id === i.id ? { ...x, completed: !x.completed } : x)); };
  const remove = async (id: number) => { await del(`/api/study/${id}`); setItems(p => p.filter(i => i.id !== id)); };

  const subjects = Array.from(new Set(items.map(i => i.subject)));
  const done = items.filter(i => i.completed).length;

  return (
    <div className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 700 }}>Study</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{done} of {items.length} done</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, alignItems: 'start' }}>
        {/* Add + checklist */}
        <Card>
          <SectionTitle sub="Track what still needs doing">Study checklist</SectionTitle>
          <div style={{ background: 'var(--paper2)', borderRadius: 11, padding: 12, marginBottom: 16 }}>
            <input placeholder="Subject / module (e.g. PHAR2805)" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} style={{ marginBottom: 8 }} />
            <input placeholder="Topic or task" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} onKeyDown={e => e.key === 'Enter' && add()} style={{ marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={form.task_type} onChange={e => setForm(f => ({ ...f, task_type: e.target.value }))} style={{ flex: 1 }}>
                {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
              <button onClick={add} style={{ background: 'var(--plum)', color: '#fff', border: 'none', borderRadius: 9, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}><Plus size={15} /> Add</button>
            </div>
          </div>

          {subjects.length === 0 && <Empty>Add your first study task above.</Empty>}
          {subjects.map(sub => (
            <div key={sub} style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--ink-soft)', marginBottom: 8 }}>{sub}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {items.filter(i => i.subject === sub).map(i => {
                  const t = TYPES.find(x => x.key === i.task_type)!;
                  const Icon = t.icon;
                  return (
                    <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: i.completed ? 0.5 : 1 }}>
                      <Check checked={i.completed} onClick={() => toggle(i)} color={t.color} />
                      <Icon size={14} style={{ color: t.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 14, textDecoration: i.completed ? 'line-through' : 'none' }}>{i.title}</span>
                      <DeleteBtn onClick={() => remove(i.id)} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </Card>

        {/* Notion */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <SectionTitle sub="Pulled from your Notion database">Notion</SectionTitle>
            <button onClick={() => { setNotionLoading(true); getJSON('/api/notion-study').then(d => { setNotion(d); setNotionLoading(false); }); }} aria-label="Refresh" style={{ background: 'none', border: 'none', color: 'var(--ink-soft)' }}><RefreshCw size={16} className={notionLoading ? 'spin' : ''} /></button>
          </div>
          {notionLoading ? (
            <Empty>Loading from Notion…</Empty>
          ) : !notion.configured ? (
            <div style={{ background: 'var(--sky-soft)', borderRadius: 11, padding: 16, fontSize: 13, color: 'var(--ink)', lineHeight: 1.6 }}>
              <strong>Notion not connected yet.</strong><br />
              To pull your study pages in here, you&apos;ll add two settings in Vercel (a Notion token and your database ID). It takes a few minutes — ask me and I&apos;ll walk you through it step by step. Until then, use the checklist on the left.
            </div>
          ) : notion.items.length === 0 ? (
            <Empty>Connected, but no items found in that Notion database.</Empty>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {notion.items.map(n => (
                <a key={n.id} href={n.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--ink)', background: 'var(--paper2)', borderRadius: 9, padding: '9px 11px', opacity: n.done ? 0.55 : 1 }}>
                  <span style={{ width: 16, height: 16, borderRadius: 5, border: '2px solid var(--sky)', background: n.done ? 'var(--sky)' : 'transparent', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 14, textDecoration: n.done ? 'line-through' : 'none' }}>{n.title}</span>
                  {n.status && <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{n.status}</span>}
                  <ExternalLink size={13} style={{ color: 'var(--ink-soft)' }} />
                </a>
              ))}
            </div>
          )}
        </Card>
      </div>
      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
