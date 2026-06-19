'use client';
import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, UserButton, useAuth, useUser } from '@clerk/nextjs';
import { BookHeart, CalendarDays, Compass, CalendarRange, ListChecks, GraduationCap, Library, Heart, Settings as SettingsIcon } from 'lucide-react';
import { postJSON, todayISO } from '@/lib/client';
import CoverView from '@/components/CoverView';
import WeeklyView from '@/components/WeeklyView';
import QuarterlyView from '@/components/QuarterlyView';
import YearlyView from '@/components/YearlyView';
import BucketView from '@/components/BucketView';
import StudyView from '@/components/StudyView';
import LibraryView from '@/components/LibraryView';
import RelationshipsView from '@/components/RelationshipsView';
import SettingsView from '@/components/SettingsView';
import MorningGreeting from '@/components/MorningGreeting';
import Landing from '@/components/Landing';

type View = 'cover' | 'weekly' | 'quarterly' | 'yearly' | 'bucket' | 'study' | 'books' | 'people' | 'settings';

const NAV: { key: View; label: string; icon: React.ElementType }[] = [
  { key: 'cover', label: 'Cover', icon: BookHeart },
  { key: 'weekly', label: 'Weekly', icon: CalendarDays },
  { key: 'quarterly', label: 'Quarterly', icon: CalendarRange },
  { key: 'yearly', label: 'Yearly', icon: Compass },
  { key: 'bucket', label: 'Bucket List', icon: ListChecks },
  { key: 'books', label: 'Library', icon: Library },
  { key: 'people', label: 'People', icon: Heart },
  { key: 'study', label: 'Study', icon: GraduationCap },
];

function App() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [view, setView] = useState<View>('cover');
  const [ready, setReady] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);

  // set up tables for this user once signed in, then maybe greet
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    postJSON('/api/init', {}).then(() => setReady(true)).catch(() => setReady(true));
    // returning from an OAuth connect → jump to settings
    const p = new URLSearchParams(window.location.search);
    if (p.get('settings')) { setView('settings'); return; }
    try {
      const last = localStorage.getItem('lifebook-greeted');
      if (last !== todayISO()) setShowGreeting(true);
    } catch { /* localStorage unavailable */ }
  }, [isLoaded, isSignedIn]);

  const dismissGreeting = () => {
    try { localStorage.setItem('lifebook-greeted', todayISO()); } catch {}
    setShowGreeting(false);
  };

  const firstName = user?.firstName || 'there';

  return (
    <div style={{ minHeight: '100vh' }}>
      {showGreeting && ready && (
        <MorningGreeting name={firstName} onClose={dismissGreeting} onGoWeekly={() => { dismissGreeting(); setView('weekly'); }} />
      )}

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
          {/* profile / sign-out */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 8 }}>
            <button onClick={() => setView('settings')} aria-label="Settings" title="Integrations & settings" style={{
              display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
              background: view === 'settings' ? 'var(--ink)' : 'transparent',
              color: view === 'settings' ? 'var(--paper)' : 'var(--ink-soft)',
              border: 'none', borderRadius: 9, padding: '7px 10px', fontSize: 13.5, fontWeight: 500,
            }}><SettingsIcon size={16} /></button>
            <UserButton afterSignOutUrl="/" />
          </div>
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
            {view === 'books' && <LibraryView />}
            {view === 'people' && <RelationshipsView />}
            {view === 'study' && <StudyView />}
            {view === 'settings' && <SettingsView />}
          </>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SignedOut><Landing /></SignedOut>
      <SignedIn><App /></SignedIn>
    </>
  );
}
