'use client';
import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Eye, RefreshCw, ExternalLink, Plus, CheckCircle2, Layers } from 'lucide-react';
import { Card, SectionTitle, Check, DeleteBtn, Empty } from './ui';
import { ConnectButton } from './WellnessCards';
import { getJSON, postJSON, patchJSON, del, pop } from '@/lib/client';

type StudyItem = { id: number; subject: string; title: string; task_type: string; completed: boolean };
type NotionItem = { id: string; title: string; module: string; subtopic: string; status: string; done: boolean; url: string };

const TYPES = [
  { key: 'notes', label: 'Make notes', icon: FileText, color: 'var(--plum)' },
  { key: 'read', label: 'Read', icon: BookOpen, color: 'var(--sky)' },
  { key: 'revise', label: 'Revise', icon: Eye, color: 'var(--gold)' },
];

// module code → colour (matches the Notion select colours)
const MODULE_COLOUR: Record<string, string> = {
  '3801': 'var(--ink-soft)', '3802': 'var(--plum)', '3803': 'var(--gold)',
  '3804': 'var(--sky)', '3805': 'var(--rose)',
};
const moduleColour = (m: string) => MODULE_COLOUR[m] || 'var(--plum)';

// status → colour + style
const STATUS_COLOUR: Record<string, string> = {
  'Make notes': 'var(--rose)', 'Read': 'var(--terra)', 'Revise': 'var(--sky)', 'Done': 'var(--sage)',
};
const statusColour = (s: string) => STATUS_COLOUR[s] || 'var(--ink-soft)';

function NotionTracker() {
  const [data, setData] = useState<{ configured: boolean; items: NotionItem[]; error?: string }>({ configured: false, items: [] });
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); getJSON('/api/notion-study').then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  // group items: module → subtopic → items
  const byModule: Record<string, Record<string, NotionItem[]>> = {};
  for (const it of data.items) {
    (byModule[it.module] ||= {});
    (byModule[it.module][it.subtopic || 'General'] ||= []).push(it);
  }
  const modules = Object.keys(byModule).sort();

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <SectionTitle sub="Live from your Notion Study Tracker">My study tracker</SectionTitle>
        <button onClick={load} aria-label="Refresh" style={{ background: 'none', border: 'none', color: 'var(--ink-soft)' }}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {loading ? (
        <Empty>Loading from Notion…</Empty>
      ) : !data.configured ? (
        <div style={{ background: 'var(--sky-soft)', borderRadius: 11, padding: 16, fontSize: 13, lineHeight: 1.6 }}>
          <strong>Notion isn&apos;t connected yet.</strong><br />
          Once you add the two settings in Vercel (token + database ID), your Study Tracker shows up here automatically. The checklist below works in the meantime.
        </div>
      ) : data.error ? (
        <div style={{ background: 'var(--rose-soft)', borderRadius: 11, padding: 16, fontSize: 13, lineHeight: 1.6 }}>
          Couldn&apos;t load Notion ({data.error}). Usually this means the database hasn&apos;t been shared with your integration yet, or the database ID is off. Double-check those two and hit refresh.
        </div>
      ) : data.items.length === 0 ? (
        <Empty>Connected! Add a row in your Notion Study Tracker and it&apos;ll appear here.</Empty>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {modules.map(mod => {
            const colour = moduleColour(mod);
            const subtopics = byModule[mod];
            const allItems = Object.values(subtopics).flat();
            const done = allItems.filter(i => i.done).length;
            return (
              <div key={mod}>
                {/* module header in its colour */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ background: colour, color: '#fff', fontWeight: 700, fontSize: 15, borderRadius: 8, padding: '4px 12px', fontFamily: 'var(--serif)' }}>{mod}</span>
                  <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{done}/{allItems.length} done</span>
                </div>
                {Object.keys(subtopics).sort().map(sub => (
                  <div key={sub} style={{ marginBottom: 12, paddingLeft: 6, borderLeft: `2px solid ${colour}33`, marginLeft: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, paddingLeft: 8 }}>{sub}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingLeft: 8 }}>
                      {subtopics[sub].map(it => (
                        <a key={it.id} href={it.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--ink)', opacity: it.done ? 0.55 : 1 }}>
                          {it.done
                            ? <CheckCircle2 size={16} style={{ color: 'var(--sage)', flexShrink: 0 }} />
                            : <span style={{ width: 14, height: 14, borderRadius: 4, border: `2px solid ${statusColour(it.status)}`, flexShrink: 0 }} />}
                          <span style={{ flex: 1, fontSize: 14, textDecoration: it.done ? 'line-through' : 'none' }}>{it.title}</span>
                          {it.status && (
                            <span style={{ fontSize: 11, fontWeight: 600, color: statusColour(it.status), background: `${statusColour(it.status)}1a`, borderRadius: 12, padding: '2px 9px' }}>{it.status}</span>
                          )}
                          <ExternalLink size={12} style={{ color: 'var(--ink-soft)', opacity: 0.5 }} />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Card>
  );
}

function ManualChecklist() {
  const [items, setItems] = useState<StudyItem[]>([]);
  const [form, setForm] = useState({ subject: '', title: '', task_type: 'notes' });
  useEffect(() => { getJSON('/api/study').then(setItems); }, []);
  const add = async () => {
    if (!form.title.trim()) return;
    const subject = form.subject.trim() || 'General';
    const r = await postJSON('/api/study', { ...form, subject });
    setItems(p => [...p, r]); setForm({ subject: form.subject, title: '', task_type: form.task_type });
  };
  const toggle = async (i: StudyItem) => { if (!i.completed) pop(); await patchJSON(`/api/study/${i.id}`, { completed: !i.completed }); setItems(p => p.map(x => x.id === i.id ? { ...x, completed: !x.completed } : x)); };
  const remove = async (id: number) => { await del(`/api/study/${id}`); setItems(p => p.filter(i => i.id !== id)); };
  const subjects = Array.from(new Set(items.map(i => i.subject)));
  return (
    <Card>
      <SectionTitle sub="A quick app-only list (no Notion needed)">Extra checklist</SectionTitle>
      <div style={{ background: 'var(--paper2)', borderRadius: 11, padding: 12, marginBottom: 16 }}>
        <input placeholder="Subject / module" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} style={{ marginBottom: 8 }} />
        <input placeholder="Topic or task" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} onKeyDown={e => e.key === 'Enter' && add()} style={{ marginBottom: 8 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={form.task_type} onChange={e => setForm(f => ({ ...f, task_type: e.target.value }))} style={{ flex: 1 }}>
            {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <button onClick={add} style={{ background: 'var(--plum)', color: '#fff', border: 'none', borderRadius: 9, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}><Plus size={15} /> Add</button>
        </div>
      </div>
      {subjects.length === 0 && <Empty>Optional — for anything you don&apos;t keep in Notion.</Empty>}
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
  );
}

export default function StudyView() {
  return (
    <div className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 700 }}>Study</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>your Year 3 tracker, straight from Notion</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, alignItems: 'start' }}>
        <NotionTracker />
        <ManualChecklist />
        <Card>
          <SectionTitle sub="Flashcards (when you're ready)"><Layers size={17} style={{ display: 'inline', verticalAlign: -3, marginRight: 6, color: 'var(--gold)' }} />Anki</SectionTitle>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: 14 }}>
            Not connected. If you decide you want your Anki decks in here later, hit the button and we&apos;ll look at the options together.
          </p>
          <ConnectButton
            label="Connect Anki"
            color="var(--gold)"
            icon={<Layers size={16} />}
            title="Connecting Anki"
            body={<>
              Worth knowing up front: Anki is harder to plug in than Notion or Calendar. AnkiWeb has no public API, and the usual bridge (AnkiConnect) only works on a <strong>desktop with Anki open</strong> — not from a phone.
              <br /><br />
              So a live two-way sync isn&apos;t really on the cards, but there are workarounds — pulling in your due-card counts, or a desktop export. When you want to explore it, tell Claude <strong>&ldquo;let&apos;s look at Anki&rdquo;</strong> and we&apos;ll find the best option.
            </>}
          />
        </Card>
      </div>
    </div>
  );
}
