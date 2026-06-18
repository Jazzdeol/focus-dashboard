import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb();
  const date = req.nextUrl.searchParams.get('date');
  if (date) { const r = await sql`SELECT * FROM sleep_logs WHERE user_id=${userId} AND log_date=${date}`; return NextResponse.json(r[0] || null); }
  const rows = await sql`SELECT * FROM sleep_logs WHERE user_id=${userId} ORDER BY log_date DESC LIMIT 30`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { log_date, bedtime, wake_time, hours, quality, notes } = await req.json();
  const r = await sql`INSERT INTO sleep_logs (user_id, log_date, bedtime, wake_time, hours, quality, notes)
    VALUES (${userId}, ${log_date}, ${bedtime || null}, ${wake_time || null}, ${hours || null}, ${quality || null}, ${notes || null})
    ON CONFLICT (user_id, log_date) DO UPDATE SET bedtime=COALESCE(${bedtime || null}, sleep_logs.bedtime),
      wake_time=COALESCE(${wake_time || null}, sleep_logs.wake_time),
      hours=COALESCE(${hours || null}, sleep_logs.hours),
      quality=COALESCE(${quality || null}, sleep_logs.quality),
      notes=COALESCE(${notes || null}, sleep_logs.notes), updated_at=NOW()
    RETURNING *`;
  return NextResponse.json(r[0]);
}
