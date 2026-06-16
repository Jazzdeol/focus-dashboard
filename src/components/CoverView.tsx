'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { getJSON, postJSON, del } from '@/lib/client';

type Photo = { id: number; image_data: string; caption: string; rotation: number };

// downscale + compress an uploaded image to keep DB rows small
function compress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const max = 700;
        let { width, height } = img;
        if (width > height && width > max) { height = (height * max) / width; width = max; }
        else if (height > max) { width = (width * max) / height; height = max; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CoverView({ onEnter }: { onEnter: () => void }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { getJSON('/api/cover').then(setPhotos); }, []);

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    setBusy(true);
    for (const file of Array.from(files).slice(0, 8)) {
      try {
        const data = await compress(file);
        const rotation = (Math.random() * 8 - 4);
        const p = await postJSON('/api/cover', { image_data: data, caption: '', rotation });
        setPhotos(prev => [...prev, p]);
      } catch { /* skip bad file */ }
    }
    setBusy(false);
  };

  const remove = async (id: number) => { await del(`/api/cover/${id}`); setPhotos(p => p.filter(x => x.id !== id)); };
  const saveCaption = async (id: number, caption: string) => {
    setPhotos(p => p.map(x => x.id === id ? { ...x, caption } : x));
    await fetch(`/api/cover/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption }) });
  };

  return (
    <div className="fade-in" style={{ paddingBottom: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(34px, 7vw, 56px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
          My Life Book
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 6, fontStyle: 'italic' }}>a place for everything that matters</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '18px 0 28px', flexWrap: 'wrap' }}>
        <button onClick={() => fileRef.current?.click()} disabled={busy} style={{ background: 'var(--card)', border: '1px solid var(--line-strong)', borderRadius: 10, padding: '9px 16px', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 7, color: 'var(--ink)' }}>
          <ImagePlus size={16} /> {busy ? 'Adding…' : 'Add photos'}
        </button>
        <button onClick={onEnter} style={{ background: 'var(--plum)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: 14, fontWeight: 600 }}>
          Open my planner →
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e => onFiles(e.target.files)} />
      </div>

      {photos.length === 0 ? (
        <div style={{ maxWidth: 460, margin: '0 auto', textAlign: 'center', padding: '40px 20px', border: '2px dashed var(--line-strong)', borderRadius: 18, color: 'var(--ink-soft)' }}>
          <ImagePlus size={32} style={{ opacity: 0.5, marginBottom: 10 }} />
          <p style={{ fontSize: 14 }}>Add your favourite photos to make this cover your own.<br />They&apos;ll be arranged like a scrapbook.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18, maxWidth: 1000, margin: '0 auto' }}>
          {photos.map((p, i) => (
            <div key={p.id} style={{ position: 'relative', transform: `rotate(${p.rotation}deg)`, transition: 'transform 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'rotate(0deg) scale(1.03)')}
              onMouseLeave={e => (e.currentTarget.style.transform = `rotate(${p.rotation}deg)`)}>
              <div style={{ background: '#fff', padding: '10px 10px 0', boxShadow: '0 4px 16px rgba(43,36,25,0.18)', borderRadius: 3, width: 200 }}>
                <span className="tape" style={{ left: `${30 + (i % 3) * 18}%` }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image_data} alt={p.caption || 'memory'} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block', borderRadius: 2 }} />
                <input value={p.caption} onChange={e => saveCaption(p.id, e.target.value)} placeholder="caption…" style={{ border: 'none', background: 'transparent', textAlign: 'center', fontFamily: 'var(--serif)', fontSize: 14, padding: '8px 4px 10px', color: 'var(--ink)' }} />
              </div>
              <button onClick={() => remove(p.id)} aria-label="Remove photo" style={{ position: 'absolute', top: -8, right: -8, background: 'var(--rose)', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
