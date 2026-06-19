'use client';
import React, { useState, useEffect } from 'react';
import { Check, RefreshCw, Plug, AlertTriangle, Info } from 'lucide-react';
import { Card } from './ui';
import { getJSON, postJSON } from '@/lib/client';
import AppearanceSettings from './AppearanceSettings';

type Conn = { provider: string; label: string; connected: boolean; status: string; account: string | null };

// OAuth providers (wired up). Non-OAuth ones are shown as honest "manual" cards below.
const BLURB: Record<string, string> = {
  notion: 'Sync a study/notes database from your own Notion workspace.',
  google_calendar: 'Show your upcoming calendar events inside Life Book (read-only).',
};

const MANUAL = [
  { label: 'Apple Health', why: 'Apple doesn\u2019t allow any website to read Health data — it\u2019s phone-only by design.', alt: 'Best alternative: connect Fitbit, Oura, Garmin or Strava (these do support OAuth), or log steps manually.' },
];

export default function SettingsView() {
  const [tab, setTab] = useState<'integrations' | 'appearance'>('integrations');
  const [conns, setConns] = useState<Conn[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);

  const load = () => getJSON('/api/integrations').then(d => { setConns(d); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  // read ?connected= / ?error= left by the OAuth callback
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('connected')) setBanner({ kind: 'ok', msg: `Connected ${p.get('connected')!.replace('_', ' ')} 🎉` });
    else if (p.get('error')) setBanner({ kind: 'err', msg: errorText(p.get('error')!) });
    if (p.get('connected') || p.get('error')) window.history.replaceState({}, '', '/');
  }, []);

  const connect = (provider: string) => { window.location.href = `/api/integrations/${provider}/connect`; };
  const disconnect = async (provider: string) => { await postJSON(`/api/integrations/${provider}/disconnect`, {}); load(); };

  return (
    <div className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 700 }}>Settings</h2>
      </div>

      {/* tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 22 }}>
        {([['integrations', 'Integrations'], ['appearance', 'Appearance']] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: '8px 18px', borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            border: '1px solid var(--line-strong)',
            background: tab === k ? 'var(--ink)' : 'transparent', color: tab === k ? 'var(--paper)' : 'var(--ink-soft)',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'appearance' ? <AppearanceSettings /> : (
      <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>connect your own accounts — private to you</p>
      </div>

      {banner && (
        <div style={{ maxWidth: 620, margin: '0 auto 16px', borderRadius: 11, padding: '10px 14px', fontSize: 14,
          background: banner.kind === 'ok' ? 'var(--sage-soft)' : 'var(--rose-soft)',
          color: banner.kind === 'ok' ? 'var(--sage)' : 'var(--rose)' }}>{banner.msg}</div>
      )}

      <div style={{ maxWidth: 620, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {loading ? <Card><p style={{ color: 'var(--ink-soft)' }}>Loading…</p></Card> : conns.map(c => (
          <Card key={c.provider}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--paper2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Plug size={19} style={{ color: 'var(--plum)' }} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 600 }}>{c.label}</span>
                  {c.connected && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--sage)', background: 'var(--sage-soft)', borderRadius: 10, padding: '2px 9px', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Check size={11} /> Connected</span>}
                  {c.status === 'reconnect_needed' && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gold)', background: 'var(--gold-soft)', borderRadius: 10, padding: '2px 9px', display: 'inline-flex', alignItems: 'center', gap: 3 }}><RefreshCw size={11} /> Reconnect needed</span>}
                </div>
                <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>{c.account ? c.account : BLURB[c.provider] || ''}</p>
              </div>
              {c.connected ? (
                <button onClick={() => disconnect(c.provider)} style={{ background: 'transparent', color: 'var(--ink-soft)', border: '1px solid var(--line-strong)', borderRadius: 9, padding: '8px 14px', fontSize: 13, fontWeight: 500, flexShrink: 0 }}>Disconnect</button>
              ) : c.status === 'reconnect_needed' ? (
                <button onClick={() => connect(c.provider)} style={{ background: 'var(--gold)', color: '#fff', border: 'none', borderRadius: 9, padding: '8px 14px', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>Reconnect</button>
              ) : (
                <button onClick={() => connect(c.provider)} style={{ background: 'var(--plum)', color: '#fff', border: 'none', borderRadius: 9, padding: '8px 16px', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>Connect</button>
              )}
            </div>
          </Card>
        ))}

        {/* honest "can't OAuth" cards */}
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--ink-soft)', marginTop: 10, paddingLeft: 4 }}>NOT AVAILABLE VIA AUTO-CONNECT</p>
        {MANUAL.map(m => (
          <Card key={m.label}>
            <div style={{ display: 'flex', gap: 12 }}>
              <AlertTriangle size={18} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{m.label}</div>
                <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: 4 }}>{m.why}</p>
                <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5, display: 'flex', gap: 5 }}><Info size={14} style={{ color: 'var(--sky)', flexShrink: 0, marginTop: 2 }} />{m.alt}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      </div>
      )}
    </div>
  );
}

function errorText(code: string) {
  switch (code) {
    case 'not_configured': return 'That integration isn\u2019t set up yet (missing keys). ';
    case 'denied': return 'You cancelled the connection.';
    case 'bad_state': return 'Security check failed — please try connecting again.';
    case 'exchange_failed': return 'Couldn\u2019t complete the connection. Try again.';
    default: return 'Something went wrong connecting.';
  }
}
