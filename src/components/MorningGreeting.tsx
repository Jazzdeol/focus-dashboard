'use client';
import React, { useState, useEffect } from 'react';
import { Sun, X, Bell } from 'lucide-react';
import { getJSON, mondayOf, todayISO } from '@/lib/client';
import { dailyQuote } from '@/lib/quotes';

type Task = { id: number; title: string; completed: boolean };
type Gym = { id: number; day_label: string; focus: string; completed: boolean };

export default function MorningGreeting({ name = 'there', onClose, onGoWeekly }: { name?: string; onClose: () => void; onGoWeekly: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [gym, setGym] = useState<Gym[]>([]);
  const [habitsLeft, setHabitsLeft] = useState(0);

  useEffect(() => {
    const week = mondayOf();
    getJSON(`/api/tasks?week=${week}`).then(t => setTasks(t.filter((x: Task) => !x.completed)));
    getJSON(`/api/gym?week=${week}`).then(setGym);
    getJSON('/api/habits').then(d => {
      const today = todayISO();
      const loggedToday = new Set(d.logs.filter((l: { logged_date: string }) => l.logged_date.startsWith(today)).map((l: { habit_id: number }) => l.habit_id));
      setHabitsLeft(d.habits.filter((h: { id: number }) => !loggedToday.has(h.id)).length);
    });
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const dayName = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const quote = dailyQuote();

  const requestNotifications = async () => {
    if (!('Notification' in window)) { alert('This device does not support notifications.'); return; }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      new Notification(`${greeting}, ${name}!`, { body: quote });
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(43,36,25,0.45)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="fade-in" style={{ background: 'var(--card)', borderRadius: 20, padding: 30, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(43,36,25,0.3)', position: 'relative' }}>
        <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--ink-soft)' }}><X size={18} /></button>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <Sun size={26} style={{ color: 'var(--gold)' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 700 }}>{greeting}, {name}</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 14 }}>{dayName}</p>

        <div style={{ background: 'var(--gold-soft)', borderLeft: '3px solid var(--gold)', borderRadius: 8, padding: '10px 12px', marginBottom: 18, fontStyle: 'italic', fontSize: 14, fontFamily: 'var(--serif)' }}>
          &ldquo;{quote}&rdquo;
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
          <Line emoji="📋" text={tasks.length ? `${tasks.length} task${tasks.length > 1 ? 's' : ''} still to do` : 'No tasks left — lovely'} />
          <Line emoji="🔥" text={habitsLeft ? `${habitsLeft} habit${habitsLeft > 1 ? 's' : ''} to check in today` : 'All habits done for today'} />
          {gym.filter(g => !g.completed).length > 0 && <Line emoji="💪" text={`${gym.filter(g => !g.completed).length} gym session${gym.filter(g => !g.completed).length > 1 ? 's' : ''} planned`} />}
          {tasks.length > 0 && <div style={{ background: 'var(--paper2)', borderRadius: 11, padding: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>First up</p>
            {tasks.slice(0, 3).map(t => <p key={t.id} style={{ fontSize: 14, padding: '2px 0' }}>· {t.title}</p>)}
          </div>}
        </div>

        <button onClick={onGoWeekly} style={{ width: '100%', background: 'var(--plum)', color: '#fff', border: 'none', borderRadius: 11, padding: 12, fontWeight: 600, fontSize: 15, marginBottom: 10 }}>
          Let&apos;s go →
        </button>
        <button onClick={requestNotifications} style={{ width: '100%', background: 'transparent', border: '1px solid var(--line-strong)', borderRadius: 11, padding: 10, fontWeight: 500, fontSize: 13, color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Bell size={14} /> Turn on daily reminders
        </button>
      </div>
    </div>
  );
}

function Line({ emoji, text }: { emoji: string; text: string }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}><span style={{ fontSize: 18 }}>{emoji}</span>{text}</div>;
}
