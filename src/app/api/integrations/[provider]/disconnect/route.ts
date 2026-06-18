import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
import { isProvider } from '@/lib/integrations';

export async function POST(_req: NextRequest, { params }: { params: { provider: string } }) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  if (!isProvider(params.provider)) return NextResponse.json({ error: 'unknown provider' }, { status: 400 });
  const sql = getDb();
  await sql`DELETE FROM integration_accounts WHERE user_id=${userId} AND provider=${params.provider}`;
  return NextResponse.json({ ok: true });
}
