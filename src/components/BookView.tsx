'use client';
import React, { useState, useEffect } from 'react';
import { Search, Plus, BookMarked, BookOpen, CheckCircle2, X } from 'lucide-react';
import { Card, Empty } from './ui';
import { getJSON, postJSON, patchJSON, del, pop } from '@/lib/client';

type Book = { id: number; title: string; author: string; cover_id: string | null; status: string };
type Result = { title: string; author: string; cover_id: string | null; year: number | null; key: string };

const STATUSES = [
  { key: 'want', label: 'Want to read', icon: BookMarked, color: 'var(--plum)' },
  { key: 'reading', label: 'Reading', icon: BookOpen, color: 'var(--gold)' },
  { key: 'read', label: 'Read', icon: CheckCircle2, color: 'var(--sage)' },
];
const coverUrl = (id: string | null, size: 'M' | 'L' = 'M') => id ? `https://covers.openlibrary.org/b/id/${id}-${size}.jpg` : null;

function Cover({ id, title, w = 70, h = 104 }: { id: string | null; title: string; w?: number; h?: number }) {
  const url = coverUrl(id);
  if (!url) return (
    <div style={{ width: w, height: h, borderRadius: 6, background: 'var(--paper2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 6 }}>
      <span style={{ fontSize: 10, color: 'var(--ink-soft)', textAlign: 'center', lineHeight: 1.2 }}>{title.slice(0, 30)}</span>
    </div>
  );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={title} style={{ width: w, height: h, objectFit: 'cover', borderRadius: 6, flexShrink: 0, boxShadow: '0 2px 6px rgba(43,36,25,0.18)' }} />;
}

export default function BookView() {
  const [books, setBooks] = useState<Book[]>([]);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => { getJSON('/api/books').then(setBooks); }, []);

  const search = async () => {
    if (!q.trim()) return;
    setSearching(true); setSearched(true);
    const r = await getJSON(`/api/book-search?q=${encodeURIComponent(q)}`);
    setResults(r); setSearching(false);
  };
  const addBook = async (r: Result, status: string) => {
    const b = await postJSON('/api/books', { title: r.title, author: r.author, cover_id: r.cover_id, status });
    setBooks(p => [b, ...p]); pop();
  };
  const setStatus = async (b: Book, status: string) => {
    if (status === 'read' && b.status !== 'read') pop();
    await patchJSON(`/api/books/${b.id}`, { status });
    setBooks(p => p.map(x => x.id === b.id ? { ...x, status } : x));
  };
  const remove = async (id: number) => { await del(`/api/books/${id}`); setBooks(p => p.filter(b => b.id !== id)); };

  const alreadyHave = (title: string, author: string) => books.some(b => b.title === title && b.author === author);

  return (
    <div className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 700 }}>Bookshelf</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{books.length} book{books.length !== 1 ? 's' : ''} on your shelf</p>
      </div>

      {/* search */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: results.length || searched ? 16 : 0 }}>
          <input placeholder="Search a book by title…" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
          <button onClick={search} style={{ background: 'var(--plum)', color: '#fff', border: 'none', borderRadius: 9, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <Search size={16} /> Search
          </button>
        </div>
        {searching && <Empty>Searching Open Library…</Empty>}
        {!searching && searched && results.length === 0 && <Empty>No books found — try a different title.</Empty>}
        {!searching && results.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {results.map((r, i) => (
              <div key={r.key + i} style={{ display: 'flex', gap: 12, background: 'var(--paper2)', borderRadius: 11, padding: 10 }}>
                <Cover id={r.cover_id} title={r.title} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 'auto' }}>{r.author}{r.year ? ` · ${r.year}` : ''}</div>
                  {alreadyHave(r.title, r.author) ? (
                    <span style={{ fontSize: 12, color: 'var(--sage)', fontWeight: 600, marginTop: 8 }}>✓ On your shelf</span>
                  ) : (
                    <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                      {STATUSES.map(s => (
                        <button key={s.key} onClick={() => addBook(r, s.key)} title={`Add to ${s.label}`} style={{ fontSize: 11, fontWeight: 600, color: s.color, background: 'var(--card)', border: `1px solid ${s.color}55`, borderRadius: 14, padding: '4px 9px', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Plus size={11} /> {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* shelves */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 16 }}>
        {STATUSES.map(s => {
          const shelf = books.filter(b => b.status === s.key);
          const Icon = s.icon;
          return (
            <Card key={s.key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: s.color + '1c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={16} style={{ color: s.color }} /></span>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>{s.label}</h3>
                <span style={{ fontSize: 12, color: 'var(--ink-soft)', marginLeft: 'auto' }}>{shelf.length}</span>
              </div>
              {shelf.length === 0 && <Empty>Nothing here yet.</Empty>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {shelf.map(b => (
                  <div key={b.id} style={{ display: 'flex', gap: 10 }}>
                    <Cover id={b.cover_id} title={b.title} w={48} h={72} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{b.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 6 }}>{b.author}</div>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <select value={b.status} onChange={e => setStatus(b, e.target.value)} style={{ fontSize: 12, padding: '3px 6px', width: 'auto', flex: 1 }}>
                          {STATUSES.map(st => <option key={st.key} value={st.key}>{st.label}</option>)}
                        </select>
                        <button onClick={() => remove(b.id)} aria-label="Remove" style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', opacity: 0.5, padding: 2 }}><X size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
