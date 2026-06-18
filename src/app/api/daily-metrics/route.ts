import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb();
  const date = req.nextUrl.searchParams.get('date');
  if (date) { const r = await sql`SELECT * FROM daily_metrics WHERE user_id=${userId} AND log_date=${date}`; return NextResponse.json(r[0] || null); }
  const rows = await sql`SELECT * FROM daily_metrics WHERE user_id=${userId} ORDER BY log_date DESC LIMIT 30`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { log_date, steps, screen_minutes } = await req.json();
  const r = await sql`INSERT INTO daily_metrics (user_id, log_date, steps, screen_minutes)
    VALUES (${userId}, ${log_date}, ${steps ?? null}, ${screen_minutes ?? null})
    ON CONFLICT (user_id, log_date) DO UPDATE SET
      steps=COALESCE(${steps ?? null}, daily_metrics.steps),
      screen_minutes=COALESCE(${screen_minutes ?? null}, daily_metrics.screen_minutes),
      updated_at=NOW() RETURNING *`;
  return NextResponse.json(r[0]);
}
