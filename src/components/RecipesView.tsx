'use client';
import React, { useState, useEffect } from 'react';
import { Search, Plus, Clock, Users, ExternalLink, X, Heart } from 'lucide-react';
import { Card, Empty } from './ui';
import { getJSON, postJSON, del, pop } from '@/lib/client';

type Recipe = { id: number; spoonacular_id: string | null; title: string; image: string | null; source_url: string | null; ready_minutes: number | null; servings: number | null };
type Result = Omit<Recipe, 'id'>;

export default function RecipesView() {
  const [saved, setSaved] = useState<Recipe[]>([]);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => { getJSON('/api/recipes').then(setSaved); }, []);

  const search = async () => {
    if (!q.trim()) return;
    setSearching(true); setSearched(true); setNotice('');
    const r = await getJSON(`/api/recipe-search?q=${encodeURIComponent(q)}`);
    if (r && r.error === 'not_configured') { setNotice('Recipe search needs a Spoonacular API key added in settings.'); setResults([]); }
    else if (r && r.error === 'quota') { setNotice('Today\u2019s recipe search limit has been reached — try again tomorrow.'); setResults([]); }
    else setResults(Array.isArray(r) ? r : []);
    setSearching(false);
  };
  const save = async (r: Result) => { const s = await postJSON('/api/recipes', r); setSaved(p => [s, ...p]); pop(); };
  const remove = async (id: number) => { await del(`/api/recipes/${id}`); setSaved(p => p.filter(x => x.id !== id)); };
  const isSaved = (sid: string | null) => saved.some(s => s.spoonacular_id === sid);

  const RecipeCard = ({ r, savedView }: { r: Result | Recipe; savedView: boolean }) => (
    <div style={{ background: 'var(--paper2)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {r.image && /* eslint-disable-next-line @next/next/no-img-element */
        <img src={r.image} alt={r.title} style={{ width: '100%', height: 130, objectFit: 'cover' }} />}
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, marginBottom: 6 }}>{r.title}</div>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--ink-soft)', marginBottom: 'auto' }}>
          {r.ready_minutes ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Clock size={12} /> {r.ready_minutes}m</span> : null}
          {r.servings ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Users size={12} /> {r.servings}</span> : null}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'center' }}>
          {r.source_url && <a href={r.source_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 600, color: 'var(--sky)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><ExternalLink size={12} /> Recipe</a>}
          <div style={{ marginLeft: 'auto' }}>
            {savedView ? (
              <button onClick={() => remove((r as Recipe).id)} aria-label="Remove" style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', opacity: 0.55 }}><X size={15} /></button>
            ) : isSaved(r.spoonacular_id) ? (
              <span style={{ fontSize: 12, color: 'var(--sage)', fontWeight: 600 }}>✓ Saved</span>
            ) : (
              <button onClick={() => save(r as Result)} style={{ fontSize: 12, fontWeight: 600, color: 'var(--rose)', background: 'var(--card)', border: '1px solid var(--rose)', borderRadius: 14, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 3 }}><Plus size={12} /> Save</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 700 }}>Recipes</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>find dishes and keep your favourites</p>
      </div>

      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: (results.length || searched) ? 16 : 0 }}>
            <input placeholder="Search recipes — e.g. 'pasta', 'chicken curry'…" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
            <button onClick={search} style={{ background: 'var(--rose)', color: '#fff', border: 'none', borderRadius: 9, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <Search size={16} /> Search
            </button>
          </div>
          {notice && <div style={{ background: 'var(--gold-soft)', borderRadius: 11, padding: 14, fontSize: 13, lineHeight: 1.5 }}>{notice}</div>}
          {searching && <Empty>Searching recipes…</Empty>}
          {!searching && searched && !notice && results.length === 0 && <Empty>No recipes found — try another search.</Empty>}
          {!searching && results.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {results.map((r, i) => <RecipeCard key={(r.spoonacular_id || '') + i} r={r} savedView={false} />)}
            </div>
          )}
        </Card>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 4px 14px' }}>
          <Heart size={16} style={{ color: 'var(--rose)' }} />
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Saved recipes</h3>
          <span style={{ fontSize: 12, color: 'var(--ink-soft)', marginLeft: 'auto' }}>{saved.length}</span>
        </div>
        {saved.length === 0 ? <Empty>Search above and save the ones you like.</Empty> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {saved.map(r => <RecipeCard key={r.id} r={r} savedView={true} />)}
          </div>
        )}
      </div>
    </div>
  );
}
