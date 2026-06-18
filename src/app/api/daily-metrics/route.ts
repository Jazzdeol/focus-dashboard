import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET(req: NextRequest) {
  const sql = getDb();
  const date = req.nextUrl.searchParams.get('date');
  if (date) { const r = await sql`SELECT * FROM daily_metrics WHERE log_date=${date}`; return NextResponse.json(r[0] || null); }
  const rows = await sql`SELECT * FROM daily_metrics ORDER BY log_date DESC LIMIT 30`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const sql = getDb(); const { log_date, steps, screen_minutes } = await req.json();
  const r = await sql`INSERT INTO daily_metrics (log_date, steps, screen_minutes)
    VALUES (${log_date}, ${steps ?? null}, ${screen_minutes ?? null})
    ON CONFLICT (log_date) DO UPDATE SET
      steps=COALESCE(${steps ?? null}, daily_metrics.steps),
      screen_minutes=COALESCE(${screen_minutes ?? null}, daily_metrics.screen_minutes),
      updated_at=NOW() RETURNING *`;
  return NextResponse.json(r[0]);
}
