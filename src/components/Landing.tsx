'use client';
import React from 'react';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { BookHeart, CalendarDays, Target, Dumbbell, Moon, Library, Compass, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon: CalendarDays, title: 'Weekly planner', body: 'Tasks, goals, a colour-coded habit grid, food & protein, gym weights and sleep — all in one place.', color: 'var(--plum)' },
  { icon: Target, title: 'Quarterly & yearly', body: 'Finances, achievements, a parking lot for ideas, and a year-in-review with your own reflections.', color: 'var(--sage)' },
  { icon: Dumbbell, title: 'Track your body', body: 'Log workouts and watch last week’s weights so you always know what to beat. Steps, sleep and calories too.', color: 'var(--terra)' },
  { icon: Library, title: 'Books & bucket list', body: 'Search any book and shelve it, and keep a bucket list across travel, career, creative and more.', color: 'var(--gold)' },
  { icon: Compass, title: 'Your year, mapped', body: 'A “Wrapped” summary of your workouts, habits and a globe showing the percentage of the world you’ve explored.', color: 'var(--sky)' },
  { icon: Moon, title: 'Gentle by design', body: 'A warm, paper-and-ink journal feel, a morning greeting, and a daily quote to start the day.', color: 'var(--rose)' },
];

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* top bar */}
      <header style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookHeart size={22} style={{ color: 'var(--plum)' }} />
          <span style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 20 }}>Life Book</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <SignInButton mode="modal">
            <button style={{ background: 'transparent', border: '1px solid var(--line-strong)', borderRadius: 9, padding: '8px 16px', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Log in</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button style={{ background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 9, padding: '8px 16px', fontSize: 14, fontWeight: 600 }}>Sign up free</button>
          </SignUpButton>
        </div>
      </header>

      {/* hero */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '50px 20px 30px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--gold-soft)', color: 'var(--gold)', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600, marginBottom: 22 }}>
          <Sparkles size={14} /> Your whole life, in one calm place
        </div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(38px, 7vw, 60px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 18 }}>
          A planner for your habits, goals and everything in between
        </h1>
        <p style={{ fontSize: 17, color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 560, margin: '0 auto 28px' }}>
          Life Book brings your weekly plans, habits, study, fitness, finances, reading and dreams together — in a warm, journal-style space that’s entirely your own.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <SignUpButton mode="modal">
            <button style={{ background: 'var(--plum)', color: '#fff', border: 'none', borderRadius: 11, padding: '13px 28px', fontSize: 16, fontWeight: 600 }}>Get started — it’s free</button>
          </SignUpButton>
          <SignInButton mode="modal">
            <button style={{ background: 'var(--card)', color: 'var(--ink)', border: '1px solid var(--line-strong)', borderRadius: 11, padding: '13px 24px', fontSize: 16, fontWeight: 500 }}>I already have an account</button>
          </SignInButton>
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 14 }}>Sign in with Google or email. Your data is private to you.</p>
      </section>

      {/* features */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '30px 20px 70px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {FEATURES.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: 22, boxShadow: '0 8px 24px -18px rgba(43,36,25,0.2)' }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: f.color + '1c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Icon size={20} style={{ color: f.color }} />
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.55 }}>{f.body}</p>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 44 }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 700, marginBottom: 16 }}>Ready to start your Life Book?</h2>
          <SignUpButton mode="modal">
            <button style={{ background: 'var(--plum)', color: '#fff', border: 'none', borderRadius: 11, padding: '13px 30px', fontSize: 16, fontWeight: 600 }}>Create your free account</button>
          </SignUpButton>
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '24px', color: 'var(--ink-soft)', fontSize: 13, borderTop: '1px solid var(--line)' }}>
        Life Book · a calm home for everything that matters
      </footer>
    </div>
  );
}
