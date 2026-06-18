import { getDb } from './db';
import { encrypt, decrypt } from './crypto';

// ── Provider registry ────────────────────────────────────────
// Add a new OAuth provider by adding an entry here + its two env vars.
export type ProviderId = 'notion' | 'google_calendar';

interface ProviderConfig {
  id: ProviderId;
  label: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  usesRefresh: boolean;
  clientId: () => string | undefined;
  clientSecret: () => string | undefined;
  // provider-specific tweaks to the authorize URL
  extraAuthParams?: Record<string, string>;
  // Notion authenticates the token call with HTTP Basic; Google uses body params
  tokenAuth: 'basic' | 'body';
}

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  notion: {
    id: 'notion',
    label: 'Notion',
    authUrl: 'https://api.notion.com/v1/oauth/authorize',
    tokenUrl: 'https://api.notion.com/v1/oauth/token',
    scopes: [],
    usesRefresh: false,
    clientId: () => process.env.NOTION_OAUTH_CLIENT_ID,
    clientSecret: () => process.env.NOTION_OAUTH_CLIENT_SECRET,
    extraAuthParams: { owner: 'user', response_type: 'code' },
    tokenAuth: 'basic',
  },
  google_calendar: {
    id: 'google_calendar',
    label: 'Google Calendar',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/calendar.readonly', 'openid', 'email'],
    usesRefresh: true,
    clientId: () => process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    extraAuthParams: { response_type: 'code', access_type: 'offline', prompt: 'consent' },
    tokenAuth: 'body',
  },
};

export const isProvider = (p: string): p is ProviderId => p in PROVIDERS;

// Base URL used to build the exact redirect URI registered with each provider.
export function baseUrl(): string {
  return (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}
export function redirectUri(provider: ProviderId): string {
  return `${baseUrl()}/api/integrations/${provider}/callback`;
}

// ── Build the authorize URL the user gets redirected to ──────
export function buildAuthUrl(provider: ProviderId, state: string): string {
  const cfg = PROVIDERS[provider];
  const params = new URLSearchParams({
    client_id: cfg.clientId() || '',
    redirect_uri: redirectUri(provider),
    state,
    ...(cfg.extraAuthParams || {}),
  });
  if (cfg.scopes.length) params.set('scope', cfg.scopes.join(' '));
  return `${cfg.authUrl}?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  // notion extras
  workspace_name?: string;
  workspace_id?: string;
  owner?: unknown;
}

// ── Exchange the ?code= for tokens ───────────────────────────
export async function exchangeCode(provider: ProviderId, code: string): Promise<TokenResponse> {
  const cfg = PROVIDERS[provider];
  const id = cfg.clientId() || '';
  const secret = cfg.clientSecret() || '';
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' };
  const body: Record<string, string> = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri(provider),
  };
  if (cfg.tokenAuth === 'basic') {
    headers['Authorization'] = `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`;
  } else {
    body.client_id = id;
    body.client_secret = secret;
  }
  const res = await fetch(cfg.tokenUrl, { method: 'POST', headers, body: new URLSearchParams(body) });
  if (!res.ok) throw new Error(`Token exchange failed (${res.status}): ${await res.text()}`);
  return res.json();
}

async function refreshAccessToken(provider: ProviderId, refreshToken: string): Promise<TokenResponse> {
  const cfg = PROVIDERS[provider];
  const res = await fetch(cfg.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: cfg.clientId() || '',
      client_secret: cfg.clientSecret() || '',
    }),
  });
  if (!res.ok) throw new Error(`Refresh failed (${res.status})`);
  return res.json();
}

// ── Persist tokens (encrypted) for a user+provider ───────────
export async function saveTokens(userId: string, provider: ProviderId, t: TokenResponse) {
  const sql = getDb();
  const expiresAt = t.expires_in ? new Date(Date.now() + t.expires_in * 1000) : null;
  const label = t.workspace_name || null;
  const meta = JSON.stringify({ workspace_id: t.workspace_id });
  await sql`
    INSERT INTO integration_accounts (user_id, provider, access_token, refresh_token, expires_at, scope, status, account_label, metadata)
    VALUES (${userId}, ${provider}, ${encrypt(t.access_token)}, ${t.refresh_token ? encrypt(t.refresh_token) : null},
            ${expiresAt}, ${t.scope || null}, 'connected', ${label}, ${meta}::jsonb)
    ON CONFLICT (user_id, provider) DO UPDATE SET
      access_token=${encrypt(t.access_token)},
      refresh_token=COALESCE(${t.refresh_token ? encrypt(t.refresh_token) : null}, integration_accounts.refresh_token),
      expires_at=${expiresAt}, scope=${t.scope || null}, status='connected',
      account_label=COALESCE(${label}, integration_accounts.account_label),
      metadata=integration_accounts.metadata || ${meta}::jsonb,
      updated_at=NOW()`;
}

// ── Get a valid access token for a user+provider ─────────────
// Refreshes automatically if expired and a refresh token exists.
// Returns null if not connected. Marks 'reconnect_needed' on refresh failure.
export async function getValidAccessToken(userId: string, provider: ProviderId): Promise<string | null> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM integration_accounts WHERE user_id=${userId} AND provider=${provider}`;
  const row = rows[0];
  if (!row || !row.access_token) return null;

  const notExpired = !row.expires_at || new Date(row.expires_at).getTime() > Date.now() + 60_000;
  if (notExpired) return decrypt(row.access_token);

  if (!row.refresh_token) {
    await sql`UPDATE integration_accounts SET status='reconnect_needed' WHERE id=${row.id}`;
    return null;
  }
  try {
    const t = await refreshAccessToken(provider, decrypt(row.refresh_token));
    const expiresAt = t.expires_in ? new Date(Date.now() + t.expires_in * 1000) : null;
    await sql`UPDATE integration_accounts SET access_token=${encrypt(t.access_token)}, expires_at=${expiresAt}, status='connected', updated_at=NOW() WHERE id=${row.id}`;
    return t.access_token;
  } catch {
    await sql`UPDATE integration_accounts SET status='reconnect_needed' WHERE id=${row.id}`;
    return null;
  }
}
