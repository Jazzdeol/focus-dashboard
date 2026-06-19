import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';

export async function GET() {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb();
  const r = await sql`SELECT theme FROM profiles WHERE user_id=${userId}`;
  return NextResponse.json(r[0]?.theme || {});
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const theme = await req.json();
  // upsert: make sure a profile row exists, then set the theme json
  await sql`INSERT INTO profiles (user_id, theme) VALUES (${userId}, ${JSON.stringify(theme)}::jsonb)
    ON CONFLICT (user_id) DO UPDATE SET theme=${JSON.stringify(theme)}::jsonb, updated_at=NOW()`;
  return NextResponse.json({ ok: true });
}
