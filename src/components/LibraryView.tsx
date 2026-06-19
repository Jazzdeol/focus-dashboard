'use client';
import React, { useState } from 'react';
import { BookMarked, Clapperboard } from 'lucide-react';
import BookView from './BookView';
import MovieView from './MovieView';

export default function LibraryView() {
  const [tab, setTab] = useState<'books' | 'watch'>('books');
  const tabs = [
    { key: 'books' as const, label: 'Books', icon: BookMarked },
    { key: 'watch' as const, label: 'Film & TV', icon: Clapperboard },
  ];
  return (
    <div className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 700 }}>Library</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>everything you&apos;re reading and watching</p>
      </div>

      {/* toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
        {tabs.map(t => {
          const Icon = t.icon; const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 999, fontSize: 14, fontWeight: 600,
              border: '1px solid var(--line-strong)', cursor: 'pointer',
              background: active ? 'var(--ink)' : 'transparent', color: active ? 'var(--paper)' : 'var(--ink-soft)',
            }}><Icon size={15} /> {t.label}</button>
          );
        })}
      </div>

      {tab === 'books' ? <BookView /> : <MovieView />}
    </div>
  );
}
