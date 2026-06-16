'use client';
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export function Card({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={className} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: 22, boxShadow: '0 1px 3px rgba(43,36,25,0.04), 0 8px 24px -16px rgba(43,36,25,0.12)', ...style }}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2 style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.01em' }}>{children}</h2>
      {sub && <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>{sub}</p>}
    </div>
  );
}

export function AddRow({ placeholder, onAdd, accent = 'var(--plum)' }: { placeholder: string; onAdd: (v: string) => void; accent?: string }) {
  const [v, setV] = React.useState('');
  const submit = () => { if (v.trim()) { onAdd(v.trim()); setV(''); } };
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input placeholder={placeholder} value={v} onChange={e => setV(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
      <button onClick={submit} aria-label="Add" style={{ background: accent, color: '#fff', border: 'none', borderRadius: 9, padding: '0 14px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <Plus size={17} />
      </button>
    </div>
  );
}

export function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label="Delete" style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', opacity: 0.5, padding: 4, display: 'flex' }}>
      <Trash2 size={14} />
    </button>
  );
}

export function Check({ checked, onClick, color = 'var(--sage)' }: { checked: boolean; onClick: () => void; color?: string }) {
  return (
    <button onClick={onClick} aria-label={checked ? 'Mark incomplete' : 'Mark complete'} style={{
      width: 22, height: 22, borderRadius: 7, flexShrink: 0,
      border: `2px solid ${checked ? color : 'var(--line-strong)'}`,
      background: checked ? color : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
    }}>
      {checked && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </button>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p style={{ color: 'var(--ink-soft)', fontSize: 13, textAlign: 'center', padding: '18px 8px', fontStyle: 'italic' }}>{children}</p>;
}
