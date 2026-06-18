export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
import { PROVIDERS } from '@/lib/integrations';

export async function GET() {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb();
  const rows = await sql`SELECT provider, status, account_label, updated_at FROM integration_accounts WHERE user_id=${userId}`;
  type Row = { provider: string; status: string; account_label: string | null };
  const byProvider: Record<string, Row> = {};
  for (const r of rows as Row[]) byProvider[r.provider] = r;
  // return only safe, non-sensitive status — never tokens
  const list = Object.values(PROVIDERS).map(p => {
    const row = byProvider[p.id];
    return {
      provider: p.id,
      label: p.label,
      connected: !!row && row.status === 'connected',
      status: row ? row.status : 'disconnected',
      account: row?.account_label || null,
    };
  });
  return NextResponse.json(list);
}
