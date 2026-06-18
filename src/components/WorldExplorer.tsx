'use client';
import React from 'react';
import { CONTINENTS, worldStats } from '@/lib/continents';

// A wireframe globe with a progress ring (% of world explored), continent count,
// and continent chips that light up for the ones you've visited.
export default function WorldExplorer({ countries }: { countries: string[] }) {
  const { continentsVisited, continentCount, countryCount, percentExplored } = worldStats(countries);
  const visited = new Set(continentsVisited);

  const R = 52;            // globe radius
  const ringR = 64;        // progress ring radius
  const circ = 2 * Math.PI * ringR;
  const dash = (percentExplored / 100) * circ;

  return (
    <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 150, height: 150, flexShrink: 0 }}>
        <svg viewBox="0 0 150 150" width="150" height="150">
          <defs>
            <radialGradient id="globeFill" cx="38%" cy="35%" r="75%">
              <stop offset="0%" stopColor="var(--sky-soft)" />
              <stop offset="100%" stopColor="var(--sky)" stopOpacity="0.35" />
            </radialGradient>
          </defs>
          {/* progress ring */}
          <circle cx="75" cy="75" r={ringR} fill="none" stroke="var(--line)" strokeWidth="5" />
          <circle cx="75" cy="75" r={ringR} fill="none" stroke="var(--sage)" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`} transform="rotate(-90 75 75)" />
          {/* globe */}
          <circle cx="75" cy="75" r={R} fill="url(#globeFill)" stroke="var(--sky)" strokeWidth="1.5" />
          {/* parallels */}
          {[-26, 0, 26].map(dy => (
            <ellipse key={dy} cx="75" cy={75 + dy} rx={Math.sqrt(Math.max(0, R * R - dy * dy))} ry={Math.abs(dy) < 2 ? 0.6 : 6} fill="none" stroke="var(--sky)" strokeOpacity="0.4" strokeWidth="0.8" />
          ))}
          {/* meridians */}
          {[0.35, 0.7, 1].map((f, i) => (
            <ellipse key={i} cx="75" cy="75" rx={R * f} ry={R} fill="none" stroke="var(--sky)" strokeOpacity="0.4" strokeWidth="0.8" />
          ))}
          <line x1="75" y1={75 - R} x2="75" y2={75 + R} stroke="var(--sky)" strokeOpacity="0.4" strokeWidth="0.8" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--serif)', color: 'var(--ink)', lineHeight: 1 }}>{percentExplored}%</div>
          <div style={{ fontSize: 10, color: 'var(--ink-soft)' }}>explored</div>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 8 }}>
          <strong style={{ color: 'var(--ink)', fontSize: 15 }}>{countryCount}</strong> countries · <strong style={{ color: 'var(--ink)', fontSize: 15 }}>{continentCount}</strong> of 7 continents
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CONTINENTS.filter(c => c !== 'Antarctica' || visited.has('Antarctica')).map(c => {
            const on = visited.has(c);
            return (
              <span key={c} style={{
                fontSize: 12, fontWeight: on ? 600 : 400, borderRadius: 14, padding: '4px 10px',
                background: on ? 'var(--sage)' : 'var(--paper2)',
                color: on ? '#fff' : 'var(--ink-soft)',
                border: `1px solid ${on ? 'var(--sage)' : 'var(--line)'}`,
              }}>{on ? '✓ ' : ''}{c}</span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
