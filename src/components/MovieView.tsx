'use client';
import React, { useState, useEffect } from 'react';
import { Search, Plus, Bookmark, Play, CheckCircle2, X, Clapperboard, Tv } from 'lucide-react';
import { Card, Empty } from './ui';
import { getJSON, postJSON, patchJSON, del, pop } from '@/lib/client';

type Movie = { id: number; tmdb_id: string | null; media_type: string; title: string; year: string; poster: string | null; status: string };
type Result = { tmdb_id: string; media_type: string; title: string; year: string; poster: string | null };

const STATUSES = [
  { key: 'want', label: 'Want to watch', icon: Bookmark, color: 'var(--plum)' },
  { key: 'watching', label: 'Watching', icon: Play, color: 'var(--gold)' },
  { key: 'watched', label: 'Watched', icon: CheckCircle2, color: 'var(--sage)' },
];

function Poster({ url, title, w = 70, h = 104 }: { url: string | null; title: string; w?: number; h?: number }) {
  if (!url) return (
    <div style={{ width: w, height: h, borderRadius: 6, background: 'var(--paper2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 6 }}>
      <span style={{ fontSize: 10, color: 'var(--ink-soft)', textAlign: 'center', lineHeight: 1.2 }}>{title.slice(0, 30)}</span>
    </div>
  );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={title} style={{ width: w, height: h, objectFit: 'cover', borderRadius: 6, flexShrink: 0, boxShadow: '0 2px 6px rgba(43,36,25,0.18)' }} />;
}

export default function MovieView() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);

  useEffect(() => { getJSON('/api/movies').then(setMovies); }, []);

  const search = async () => {
    if (!q.trim()) return;
    setSearching(true); setSearched(true);
    const r = await getJSON(`/api/tmdb-search?q=${encodeURIComponent(q)}`);
    if (r && r.error === 'not_configured') { setNotConfigured(true); setResults([]); }
    else setResults(Array.isArray(r) ? r : []);
    setSearching(false);
  };
  const add = async (r: Result, status: string) => {
    const m = await postJSON('/api/movies', { ...r, status });
    setMovies(p => [m, ...p]); pop();
  };
  const setStatus = async (m: Movie, status: string) => {
    if (status === 'watched' && m.status !== 'watched') pop();
    await patchJSON(`/api/movies/${m.id}`, { status });
    setMovies(p => p.map(x => x.id === m.id ? { ...x, status } : x));
  };
  const remove = async (id: number) => { await del(`/api/movies/${id}`); setMovies(p => p.filter(m => m.id !== id)); };
  const alreadyHave = (tmdb_id: string) => movies.some(m => m.tmdb_id === tmdb_id);

  return (
    <div>
      {/* search */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: (results.length || searched) ? 16 : 0 }}>
          <input placeholder="Search a film or TV show…" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
          <button onClick={search} style={{ background: 'var(--plum)', color: '#fff', border: 'none', borderRadius: 9, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <Search size={16} /> Search
          </button>
        </div>
        {notConfigured && <div style={{ background: 'var(--gold-soft)', borderRadius: 11, padding: 14, fontSize: 13, lineHeight: 1.5 }}>Movie search isn&apos;t switched on yet — it needs a free TMDb API key added in settings. Ask Claude to finish that step.</div>}
        {searching && <Empty>Searching TMDb…</Empty>}
        {!searching && searched && !notConfigured && results.length === 0 && <Empty>Nothing found — try a different title.</Empty>}
        {!searching && results.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {results.map((r, i) => (
              <div key={r.tmdb_id + i} style={{ display: 'flex', gap: 12, background: 'var(--paper2)', borderRadius: 11, padding: 10 }}>
                <Poster url={r.poster} title={r.title} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: 5 }}>
                    {r.media_type === 'tv' ? <Tv size={13} style={{ color: 'var(--sky)', flexShrink: 0 }} /> : <Clapperboard size={13} style={{ color: 'var(--terra)', flexShrink: 0 }} />}
                    {r.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 'auto' }}>{r.media_type === 'tv' ? 'TV' : 'Film'}{r.year ? ` · ${r.year}` : ''}</div>
                  {alreadyHave(r.tmdb_id) ? (
                    <span style={{ fontSize: 12, color: 'var(--sage)', fontWeight: 600, marginTop: 8 }}>✓ On your list</span>
                  ) : (
                    <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                      {STATUSES.map(s => (
                        <button key={s.key} onClick={() => add(r, s.key)} title={`Add to ${s.label}`} style={{ fontSize: 11, fontWeight: 600, color: s.color, background: 'var(--card)', border: `1px solid ${s.color}55`, borderRadius: 14, padding: '4px 9px', display: 'flex', alignItems: 'center', gap: 3 }}>
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
          const shelf = movies.filter(m => m.status === s.key);
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
                {shelf.map(m => (
                  <div key={m.id} style={{ display: 'flex', gap: 10 }}>
                    <Poster url={m.poster} title={m.title} w={48} h={72} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{m.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 6 }}>{m.media_type === 'tv' ? 'TV' : 'Film'}{m.year ? ` · ${m.year}` : ''}</div>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <select value={m.status} onChange={e => setStatus(m, e.target.value)} style={{ fontSize: 12, padding: '3px 6px', width: 'auto', flex: 1 }}>
                          {STATUSES.map(st => <option key={st.key} value={st.key}>{st.label}</option>)}
                        </select>
                        <button onClick={() => remove(m.id)} aria-label="Remove" style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', opacity: 0.5, padding: 2 }}><X size={14} /></button>
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
