'use client';
import React, { useState, useEffect } from 'react';
import { BookHeart, CalendarDays, Compass, CalendarRange, ListChecks, GraduationCap } from 'lucide-react';
import { postJSON, todayISO } from '@/lib/client';
import CoverView from '@/components/CoverView';
import WeeklyView from '@/components/WeeklyView';
import QuarterlyView from '@/components/QuarterlyView';
import YearlyView from '@/components/YearlyView';
import BucketView from '@/components/BucketView';
import StudyView from '@/components/StudyView';
import MorningGreeting from '@/components/MorningGreeting';

type View = 'cover' | 'weekly' | 'quarterly' | 'yearly' | 'bucket' | 'study';

const NAV: { key: View; label: string; icon: React.ElementType }[] = [
  { key: 'cover', label: 'Cover', icon: BookHeart },
  { key: 'weekly', label: 'Weekly', icon: CalendarDays },
  { key: 'quarterly', label: 'Quarterly', icon: CalendarRange },
  { key: 'yearly', label: 'Yearly', icon: Compass },
  { key: 'bucket', label: 'Bucket List', icon: ListChecks },
  { key: 'study', label: 'Study', icon: GraduationCap },
];

export default function Home() {
  const [view, setView] = useState<View>('cover');
  const [ready, setReady] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);

  // set up tables once, then decide whether to show the morning greeting
  useEffect(() => {
    postJSON('/api/init', {}).then(() => setReady(true)).catch(() => setReady(true));
    try {
      const last = localStorage.getItem('lifebook-greeted');
      if (last !== todayISO()) setShowGreeting(true);
    } catch { /* localStorage unavailable */ }
  }, []);

  const dismissGreeting = () => {
    try { localStorage.setItem('lifebook-greeted', todayISO()); } catch {}
    setShowGreeting(false);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {showGreeting && ready && (
        <MorningGreeting
          name="Jazz"
          onClose={dismissGreeting}
          onGoWeekly={() => { dismissGreeting(); setView('weekly'); }}
        />
      )}

      {/* top navigation */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(246,241,231,0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto' }}>
          <span style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 18, marginRight: 10, whiteSpace: 'nowrap' }}>Life Book</span>
          {NAV.map(n => {
            const Icon = n.icon;
            const active = view === n.key;
            return (
              <button key={n.key} onClick={() => setView(n.key)} style={{
                display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? 'var(--paper)' : 'var(--ink-soft)',
                border: 'none', borderRadius: 9, padding: '7px 13px', fontSize: 13.5, fontWeight: 500,
              }}>
                <Icon size={15} /> {n.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px 60px' }}>
        {!ready ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--ink-soft)' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>Opening your Life Book…</div>
          </div>
        ) : (
          <>
            {view === 'cover' && <CoverView onEnter={() => setView('weekly')} />}
            {view === 'weekly' && <WeeklyView />}
            {view === 'quarterly' && <QuarterlyView />}
            {view === 'yearly' && <YearlyView />}
            {view === 'bucket' && <BucketView />}
            {view === 'study' && <StudyView />}
          </>
        )}
      </main>
    </div>
  );
}
