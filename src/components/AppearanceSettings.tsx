'use client';
import React from 'react';
import { Check } from 'lucide-react';
import { Card } from './ui';
import { useTheme } from './ThemeProvider';
import { PALETTES, PATTERNS, getPalette } from '@/lib/themes';

const PAGES = [
  { key: 'cover', label: 'Cover' }, { key: 'weekly', label: 'Weekly' }, { key: 'quarterly', label: 'Quarterly' },
  { key: 'yearly', label: 'Yearly' }, { key: 'bucket', label: 'Bucket List' }, { key: 'books', label: 'Library' },
  { key: 'people', label: 'People' }, { key: 'study', label: 'Study' },
];
const GROUPS = [
  { id: 'gentle', label: 'Gentle & pastel' }, { id: 'bold', label: 'Bold & block' }, { id: 'dark', label: 'Dark' },
] as const;
const PAT_GROUPS = [
  { id: 'plain', label: 'Plain' }, { id: 'girly', label: 'Girly' }, { id: 'sharp', label: 'Sharp' },
] as const;

export default function AppearanceSettings() {
  const { theme, updateTheme } = useTheme();
  const activePalette = theme.palette || 'classic';
  const accents = getPalette(activePalette).vars;
  const accentChoices = [
    { name: 'plum', hex: accents['--plum'] }, { name: 'rose', hex: accents['--rose'] },
    { name: 'sage', hex: accents['--sage'] }, { name: 'gold', hex: accents['--gold'] },
    { name: 'sky', hex: accents['--sky'] }, { name: 'terra', hex: accents['--terra'] },
  ];

  const setPagePixel = (key: string, hex: string | null) => {
    const next = { ...(theme.perPage || {}) };
    if (hex) next[key] = hex; else delete next[key];
    updateTheme({ perPage: next });
  };

  return (
    <div style={{ maxWidth: 660, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* palettes */}
      <Card>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Colour palette</h3>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 14 }}>Sets the whole book&apos;s colours.</p>
        {GROUPS.map(g => (
          <div key={g.id} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--ink-soft)', marginBottom: 8 }}>{g.label.toUpperCase()}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
              {PALETTES.filter(p => p.group === g.id).map(p => {
                const active = activePalette === p.id;
                return (
                  <button key={p.id} onClick={() => updateTheme({ palette: p.id })} style={{
                    textAlign: 'left', borderRadius: 12, padding: 10, cursor: 'pointer',
                    border: active ? '2px solid var(--ink)' : '1px solid var(--line-strong)',
                    background: p.vars['--card'],
                  }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                      {['--plum', '--rose', '--sage', '--gold', '--sky'].map(v => (
                        <span key={v} style={{ width: 18, height: 18, borderRadius: '50%', background: p.vars[v] }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: p.vars['--ink'] }}>
                      {active && <Check size={13} />} {p.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </Card>

      {/* patterns */}
      <Card>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Background design</h3>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 14 }}>A subtle pattern behind everything.</p>
        {PAT_GROUPS.map(g => (
          <div key={g.id} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--ink-soft)', marginBottom: 8 }}>{g.label.toUpperCase()}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PATTERNS.filter(p => p.group === g.id).map(p => {
                const active = (theme.pattern || 'dots') === p.id;
                return (
                  <button key={p.id} onClick={() => updateTheme({ pattern: p.id })} style={{
                    fontSize: 13, fontWeight: 500, borderRadius: 999, padding: '7px 14px', cursor: 'pointer',
                    border: active ? '2px solid var(--ink)' : '1px solid var(--line-strong)',
                    background: active ? 'var(--ink)' : 'transparent', color: active ? 'var(--paper)' : 'var(--ink)',
                  }}>{p.name}</button>
                );
              })}
            </div>
          </div>
        ))}
      </Card>

      {/* per-page colour */}
      <Card>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Each page&apos;s colour</h3>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 14 }}>Give individual pages their own accent (optional).</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PAGES.map(pg => {
            const current = theme.perPage?.[pg.key];
            return (
              <div key={pg.key} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ width: 92, fontSize: 13, fontWeight: 600 }}>{pg.label}</span>
                <button onClick={() => setPagePixel(pg.key, null)} title="Default" style={{
                  width: 24, height: 24, borderRadius: '50%', background: 'var(--paper2)', cursor: 'pointer',
                  border: !current ? '2px solid var(--ink)' : '1px solid var(--line-strong)', fontSize: 10, color: 'var(--ink-soft)',
                }}>—</button>
                {accentChoices.map(a => (
                  <button key={a.name} onClick={() => setPagePixel(pg.key, a.hex)} title={a.name} style={{
                    width: 24, height: 24, borderRadius: '50%', background: a.hex, cursor: 'pointer',
                    border: current === a.hex ? '2px solid var(--ink)' : '1px solid var(--line-strong)',
                  }} />
                ))}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
