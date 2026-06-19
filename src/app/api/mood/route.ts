import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET() {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb();
  const rows = await sql`SELECT * FROM mood_logs WHERE user_id=${userId} ORDER BY log_date DESC LIMIT 30`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { log_date, rating, note } = await req.json();
  const r = await sql`INSERT INTO mood_logs (user_id, log_date, rating, note) VALUES (${userId}, ${log_date}, ${rating}, ${note || ''})
    ON CONFLICT (user_id, log_date) DO UPDATE SET rating=${rating}, note=${note || ''} RETURNING *`;
  return NextResponse.json(r[0]);
}
