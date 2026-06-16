'use client';
import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Pin, Clock, Flame, StickyNote, ListTodo, X, Play, Pause, RotateCcw, Check } from 'lucide-react';

type Task = { id: number; title: string; description?: string; completed: boolean; priority: 'low' | 'medium' | 'high'; due_date?: string; };
type Habit = { id: number; name: string; icon: string; color: string; };
type HabitLog = { habit_id: number; logged_date: string; };
type Note = { id: number; title: string; content?: string; pinned: boolean; updated_at: string; };
type FocusSession = { id: number; duration_minutes: number; label?: string; completed_at: string; };

const priorityColor = { high: '#f87171', medium: '#fbbf24', low: '#4ade80' };
const priorityLabel = { high: 'High', medium: 'Med', low: 'Low' };
const today = new Date().toISOString().split('T')[0];
const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const fmtTime = (s: number) => String(Math.floor(s / 60)).padStart(2,'0') + ':' + String(s % 60).padStart(2,'0');
const EMOJI_OPTIONS = ['✨','💪','🧘','📚','💧','🏃','🥗','😴','🎯','🧠','✍️','🌿'];
const COLOR_OPTIONS = ['#a78bfa','#f472b6','#4ade80','#fbbf24','#60a5fa','#fb923c','#e879f9','#34d399'];
const PRESETS = [25, 50, 90];

function Tag({ color, label }: { color: string; label: string }) {
  return <span style={{ background: color+'22', color, border: '1px solid '+color+'44', borderRadius: 4, padding: '1px 6px', fontSize: 11, fontWeight: 600 }}>{label}</span>;
}

function Panel({ title, icon, children, action }: { title: string; icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 15 }}>
          <span style={{ color: 'var(--accent)' }}>{icon}</span>{title}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Btn({ onClick, children, style }: { onClick: () => void; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <button onClick={onClick} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', ...style }}>
      {children}
    </button>
  );
}

function TasksPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', due_date: '' });
  useEffect(() => { fetch('/api/tasks').then(r => r.json()).then(setTasks); }, []);
  const add = async () => {
    if (!form.title.trim()) return;
    const t = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }).then(r => r.json());
    setTasks(p => [t, ...p]); setForm({ title: '', description: '', priority: 'medium', due_date: '' }); setAdding(false);
  };
  const toggle = async (id: number, completed: boolean) => {
    await fetch('/api/tasks/'+id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: !completed }) });
    setTasks(p => p.map(t => t.id === id ? { ...t, completed: !completed } : t));
  };
  const del = async (id: number) => { await fetch('/api/tasks/'+id, { method: 'DELETE' }); setTasks(p => p.filter(t => t.id !== id)); };
  const pending = tasks.filter(t => !t.completed);
  const done = tasks.filter(t => t.completed);
  return (
    <Panel title="Tasks" icon={<ListTodo size={16} />} action={<Btn onClick={() => setAdding(v=>!v)}><Plus size={14} /> Add</Btn>}>
      {adding && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>
          <input placeholder="Task title" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&add()} autoFocus />
          <input placeholder="Description (optional)" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))} style={{ flex:1 }}>
              <option value="high">High priority</option><option value="medium">Medium priority</option><option value="low">Low priority</option>
            </select>
            <input type="date" value={form.due_date} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))} style={{ flex:1 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={add} style={{ flex:1, justifyContent:'center' }}>Save</Btn>
            <button onClick={()=>setAdding(false)} style={{ flex:1, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', fontSize:13, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}
      <div style={{ overflowY: 'auto', maxHeight: 360, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {tasks.length===0 && <p style={{ color:'var(--muted)', fontSize:13, textAlign:'center', padding:24 }}>No tasks yet. Add one above!</p>}
        {pending.map(t => (
          <div key={t.id} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', borderRadius:10, background:'var(--surface2)', border:'1px solid var(--border)' }}>
            <button onClick={()=>toggle(t.id,t.completed)} style={{ background:'none', border:'none', padding:0, color:'var(--muted)', cursor:'pointer', marginTop:1 }}><Circle size={18} /></button>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:500 }}>{t.title}</div>
              {t.description && <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{t.description}</div>}
              <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap', alignItems:'center' }}>
                <Tag color={priorityColor[t.priority]} label={priorityLabel[t.priority]} />
                {t.due_date && <span style={{ fontSize:11, color:'var(--muted)' }}>📅 {fmt(t.due_date)}</span>}
              </div>
            </div>
            <button onClick={()=>del(t.id)} style={{ background:'none', border:'none', color:'var(--muted)', padding:0, cursor:'pointer' }}><Trash2 size={14} /></button>
          </div>
        ))}
        {done.length>0 && <>
          <p style={{ fontSize:11, color:'var(--muted)', padding:'8px 4px 2px', fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>Done</p>
          {done.map(t=>(
            <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:10, opacity:0.5 }}>
              <button onClick={()=>toggle(t.id,t.completed)} style={{ background:'none',border:'none',padding:0,color:'var(--green)',cursor:'pointer' }}><CheckCircle2 size={18} /></button>
              <span style={{ fontSize:13, textDecoration:'line-through', flex:1 }}>{t.title}</span>
              <button onClick={()=>del(t.id)} style={{ background:'none',border:'none',color:'var(--muted)',padding:0,cursor:'pointer' }}><Trash2 size={14} /></button>
            </div>
          ))}
        </>}
      </div>
    </Panel>
  );
}

function HabitsPanel() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name:'', icon:'✨', color:'#a78bfa' });
  useEffect(() => { fetch('/api/habits').then(r=>r.json()).then(d=>{ setHabits(d.habits); setLogs(d.logs); }); }, []);
  const isLogged = (hid: number) => logs.some(l => l.habit_id===hid && l.logged_date.startsWith(today));
  const toggle = async (hid: number) => {
    const res = await fetch('/api/habits/log', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ habit_id:hid, date:today, toggle:true }) }).then(r=>r.json());
    if (res.logged) setLogs(p=>[...p,{habit_id:hid,logged_date:today}]);
    else setLogs(p=>p.filter(l=>!(l.habit_id===hid&&l.logged_date.startsWith(today))));
  };
  const add = async () => {
    if (!form.name.trim()) return;
    const h = await fetch('/api/habits', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) }).then(r=>r.json());
    setHabits(p=>[...p,h]); setForm({ name:'', icon:'✨', color:'#a78bfa' }); setAdding(false);
  };
  const del = async (id: number) => { await fetch('/api/habits/'+id, { method:'DELETE' }); setHabits(p=>p.filter(h=>h.id!==id)); };
  const getStreak = (hid: number) => {
    let streak=0; const d=new Date();
    while(true){ const ds=d.toISOString().split('T')[0]; if(logs.some(l=>l.habit_id===hid&&l.logged_date.startsWith(ds))){ streak++; d.setDate(d.getDate()-1); } else break; }
    return streak;
  };
  return (
    <Panel title="Habits" icon={<Flame size={16} />} action={<Btn onClick={()=>setAdding(v=>!v)}><Plus size={14} /> Add</Btn>}>
      {adding && (
        <div style={{ display:'flex', flexDirection:'column', gap:10, padding:12, background:'var(--surface2)', borderRadius:10, border:'1px solid var(--border)' }}>
          <input placeholder="Habit name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} autoFocus />
          <div>
            <p style={{ fontSize:11, color:'var(--muted)', marginBottom:6, fontWeight:600 }}>ICON</p>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {EMOJI_OPTIONS.map(e=>(
                <button key={e} onClick={()=>setForm(f=>({...f,icon:e}))} style={{ background:form.icon===e?'#a78bfa22':'transparent', border:'1px solid '+(form.icon===e?'#a78bfa':'var(--border)'), borderRadius:6, padding:'4px 8px', fontSize:16, cursor:'pointer' }}>{e}</button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontSize:11, color:'var(--muted)', marginBottom:6, fontWeight:600 }}>COLOUR</p>
            <div style={{ display:'flex', gap:6 }}>
              {COLOR_OPTIONS.map(c=>(
                <button key={c} onClick={()=>setForm(f=>({...f,color:c}))} style={{ width:24, height:24, background:c, border:'2px solid '+(form.color===c?'#fff':'transparent'), borderRadius:'50%', cursor:'pointer' }} />
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <Btn onClick={add} style={{ flex:1, justifyContent:'center' }}>Save</Btn>
            <button onClick={()=>setAdding(false)} style={{ flex:1, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', fontSize:13, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap:8, overflowY:'auto', maxHeight:360 }}>
        {habits.length===0 && <p style={{ color:'var(--muted)', fontSize:13, textAlign:'center', padding:24 }}>Track your daily habits here.</p>}
        {habits.map(h=>{
          const logged=isLogged(h.id); const streak=getStreak(h.id);
          return (
            <div key={h.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:12, background:logged?h.color+'18':'var(--surface2)', border:'1px solid '+(logged?h.color+'55':'var(--border)'), transition:'all 0.2s' }}>
              <span style={{ fontSize:20 }}>{h.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:500 }}>{h.name}</div>
                {streak>0 && <div style={{ fontSize:11, color:h.color, marginTop:2 }}>🔥 {streak} day streak</div>}
              </div>
              <button onClick={()=>toggle(h.id)} style={{ background:logged?h.color:'transparent', border:'2px solid '+(logged?h.color:'var(--border)'), borderRadius:'50%', width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', transition:'all 0.2s', cursor:'pointer' }}>
                {logged && <Check size={14} />}
              </button>
              <button onClick={()=>del(h.id)} style={{ background:'none', border:'none', color:'var(--muted)', padding:0, cursor:'pointer' }}><Trash2 size={13} /></button>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function NotesPanel() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Note|null>(null);
  const [form, setForm] = useState({ title:'', content:'' });
  useEffect(() => { fetch('/api/notes').then(r=>r.json()).then(setNotes); }, []);
  const add = async () => {
    if (!form.title.trim()) return;
    const n = await fetch('/api/notes', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) }).then(r=>r.json());
    setNotes(p=>[n,...p]); setForm({ title:'', content:'' }); setAdding(false);
  };
  const save = async () => {
    if (!editing) return;
    const n = await fetch('/api/notes/'+editing.id, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ title:editing.title, content:editing.content }) }).then(r=>r.json());
    setNotes(p=>p.map(x=>x.id===n.id?n:x)); setEditing(null);
  };
  const pin = async (id: number, pinned: boolean) => {
    await fetch('/api/notes/'+id, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ pinned:!pinned }) });
    setNotes(p=>p.map(n=>n.id===id?{...n,pinned:!pinned}:n).sort((a,b)=>Number(b.pinned)-Number(a.pinned)));
  };
  const del = async (id: number) => { await fetch('/api/notes/'+id, { method:'DELETE' }); setNotes(p=>p.filter(n=>n.id!==id)); };
  return (
    <Panel title="Notes" icon={<StickyNote size={16} />} action={<Btn onClick={()=>setAdding(v=>!v)}><Plus size={14} /> Add</Btn>}>
      {adding && (
        <div style={{ display:'flex', flexDirection:'column', gap:8, padding:12, background:'var(--surface2)', borderRadius:10, border:'1px solid var(--border)' }}>
          <input placeholder="Title" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} autoFocus />
          <textarea placeholder="Content..." value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} style={{ minHeight:80, resize:'vertical' }} />
          <div style={{ display:'flex', gap:8 }}>
            <Btn onClick={add} style={{ flex:1, justifyContent:'center' }}>Save</Btn>
            <button onClick={()=>setAdding(false)} style={{ flex:1, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', fontSize:13, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}
      {editing && (
        <div style={{ position:'fixed', inset:0, background:'#000a', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:24, width:'100%', maxWidth:480, display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontWeight:600 }}>Edit note</span>
              <button onClick={()=>setEditing(null)} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer' }}><X size={18} /></button>
            </div>
            <input value={editing.title} onChange={e=>setEditing(n=>n?{...n,title:e.target.value}:n)} />
            <textarea value={editing.content||''} onChange={e=>setEditing(n=>n?{...n,content:e.target.value}:n)} style={{ minHeight:160, resize:'vertical' }} />
            <Btn onClick={save} style={{ justifyContent:'center' }}>Save changes</Btn>
          </div>
        </div>
      )}
      <div style={{ overflowY:'auto', maxHeight:360, display:'flex', flexDirection:'column', gap:8 }}>
        {notes.length===0 && <p style={{ color:'var(--muted)', fontSize:13, textAlign:'center', padding:24 }}>Jot your thoughts here.</p>}
        {notes.map(n=>(
          <div key={n.id} onClick={()=>setEditing(n)} style={{ padding:'12px 14px', borderRadius:12, background:'var(--surface2)', border:'1px solid '+(n.pinned?'var(--accent)55':'var(--border)'), cursor:'pointer' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:n.content?6:0 }}>
              {n.pinned && <Pin size={11} style={{ color:'var(--accent)', transform:'rotate(45deg)' }} />}
              <span style={{ fontSize:14, fontWeight:600 }}>{n.title}</span>
            </div>
            {n.content && <p style={{ fontSize:13, color:'var(--muted)', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' } as React.CSSProperties}>{n.content}</p>}
            <div style={{ display:'flex', gap:8, marginTop:8 }} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>pin(n.id,n.pinned)} style={{ background:'none', border:'none', color:n.pinned?'var(--accent)':'var(--muted)', padding:0, cursor:'pointer', fontSize:12 }}><Pin size={13} /></button>
              <button onClick={()=>del(n.id)} style={{ background:'none', border:'none', color:'var(--muted)', padding:0, cursor:'pointer' }}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function FocusPanel() {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [selected, setSelected] = useState(25);
  const [secs, setSecs] = useState(25*60);
  const [running, setRunning] = useState(false);
  const [label, setLabel] = useState('');
  const [done, setDone] = useState(false);
  const interval = useRef<ReturnType<typeof setInterval>|null>(null);
  useEffect(() => { fetch('/api/focus').then(r=>r.json()).then(d=>{ setSessions(d.sessions); setWeeklyTotal(d.weeklyTotal); }); }, []);
  useEffect(() => {
    if (running) {
      interval.current = setInterval(() => {
        setSecs(s=>{ if(s<=1){ clearInterval(interval.current!); setRunning(false); setDone(true); return 0; } return s-1; });
      }, 1000);
    } else if (interval.current) clearInterval(interval.current);
    return () => { if(interval.current) clearInterval(interval.current); };
  }, [running]);
  const selectPreset = (m: number) => { setSelected(m); setSecs(m*60); setRunning(false); setDone(false); };
  const reset = () => { setRunning(false); setSecs(selected*60); setDone(false); };
  const logSession = async () => {
    const s = await fetch('/api/focus', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ duration_minutes:selected, label:label||undefined }) }).then(r=>r.json());
    setSessions(p=>[s,...p]); setWeeklyTotal(t=>t+selected); setDone(false); setSecs(selected*60);
  };
  const pct = ((selected*60-secs)/(selected*60))*100;
  const r=54, circ=2*Math.PI*r;
  return (
    <Panel title="Focus Timer" icon={<Clock size={16} />}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
        <div style={{ display:'flex', gap:6 }}>
          {PRESETS.map(p=>(
            <button key={p} onClick={()=>selectPreset(p)} style={{ background:selected===p?'var(--accent)':'var(--surface2)', border:'1px solid '+(selected===p?'var(--accent)':'var(--border)'), borderRadius:20, padding:'5px 14px', color:'var(--text)', fontSize:13, fontWeight:selected===p?600:400, cursor:'pointer' }}>{p}m</button>
          ))}
        </div>
        <div style={{ position:'relative', width:140, height:140 }}>
          <svg width="140" height="140" style={{ transform:'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle cx="70" cy="70" r={r} fill="none" stroke="var(--accent)" strokeWidth="6" strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} strokeLinecap="round" style={{ transition:'stroke-dashoffset 0.5s' }} />
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:2 }}>
            <span style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.02em' }}>{fmtTime(secs)}</span>
            {done && <span style={{ fontSize:11, color:'var(--green)', fontWeight:600 }}>Done!</span>}
          </div>
        </div>
        <input placeholder="Label (optional)" value={label} onChange={e=>setLabel(e.target.value)} style={{ width:'100%', maxWidth:220, textAlign:'center' }} />
        <div style={{ display:'flex', gap:8 }}>
          {!done ? (<>
            <button onClick={()=>setRunning(r=>!r)} style={{ background:'var(--accent)', border:'none', borderRadius:10, padding:'9px 20px', color:'#fff', fontWeight:600, display:'flex', alignItems:'center', gap:6, cursor:'pointer' }}>
              {running ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Start</>}
            </button>
            <button onClick={reset} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, padding:'9px 14px', color:'var(--muted)', cursor:'pointer' }}><RotateCcw size={15} /></button>
          </>) : (
            <Btn onClick={logSession} style={{ padding:'9px 20px' }}><Check size={15} /> Log session</Btn>
          )}
        </div>
        <div style={{ width:'100%', borderTop:'1px solid var(--border)', paddingTop:14, display:'flex', flexDirection:'column', gap:6 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
            <span style={{ color:'var(--muted)' }}>This week</span>
            <span style={{ fontWeight:600, color:'var(--accent)' }}>{weeklyTotal} min</span>
          </div>
          {sessions.slice(0,3).map(s=>(
            <div key={s.id} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--muted)' }}>
              <span>{s.label||'Focus session'}</span>
              <span>{s.duration_minutes}m</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function StatsBar() {
  const [stats, setStats] = useState({ tasks:0, completed:0, habits:0, loggedToday:0, notes:0, focus:0 });
  useEffect(() => {
    Promise.all([
      fetch('/api/tasks').then(r=>r.json()),
      fetch('/api/habits').then(r=>r.json()),
      fetch('/api/notes').then(r=>r.json()),
      fetch('/api/focus').then(r=>r.json()),
    ]).then(([tasks,habitsData,notes,focusData])=>{
      setStats({ tasks:tasks.length, completed:tasks.filter((t:Task)=>t.completed).length, habits:habitsData.habits.length, loggedToday:habitsData.habits.filter((h:Habit)=>habitsData.logs.some((l:HabitLog)=>l.habit_id===h.id&&l.logged_date.startsWith(today))).length, notes:notes.length, focus:focusData.weeklyTotal });
    });
  }, []);
  const items = [
    { label:'Tasks done', value:`${stats.completed}/${stats.tasks}`, color:'var(--accent)' },
    { label:'Habits today', value:`${stats.loggedToday}/${stats.habits}`, color:'var(--accent2)' },
    { label:'Notes', value:stats.notes, color:'#60a5fa' },
    { label:'Focus this week', value:`${stats.focus}m`, color:'var(--green)' },
  ];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
      {items.map(i=>(
        <div key={i.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'16px 18px' }}>
          <div style={{ fontSize:22, fontWeight:700, color:i.color, letterSpacing:'-0.03em' }}>{i.value}</div>
          <div style={{ fontSize:12, color:'var(--muted)', marginTop:3 }}>{i.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [inited, setInited] = useState(false);
  useEffect(() => { fetch('/api/init', { method:'POST' }).then(()=>setInited(true)); }, []);
  const dayOfWeek = new Date().toLocaleDateString('en-GB', { weekday:'long' });
  const dateStr = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });
  if (!inited) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--muted)', fontSize:14 }}>Setting up your dashboard…</div>
  );
  return (
    <div style={{ minHeight:'100vh', padding:'28px 24px', maxWidth:1280, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <div style={{ fontSize:13, color:'var(--muted)', fontWeight:500, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:4 }}>{dayOfWeek}</div>
          <h1 style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.03em', background:'linear-gradient(135deg,var(--text) 60%,var(--accent))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Focus
          </h1>
        </div>
        <div style={{ fontSize:13, color:'var(--muted)' }}>{dateStr}</div>
      </div>
      <div style={{ marginBottom:20 }}><StatsBar /></div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <TasksPanel />
        <HabitsPanel />
        <NotesPanel />
        <FocusPanel />
      </div>
    </div>
  );
}
