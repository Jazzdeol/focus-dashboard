import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const week = req.nextUrl.searchParams.get('week');
  const rows = week ? await sql`SELECT * FROM gym_sessions WHERE user_id=${userId} AND week_start=${week} ORDER BY created_at`
    : await sql`SELECT * FROM gym_sessions WHERE user_id=${userId} ORDER BY created_at`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { week_start, day_label, focus } = await req.json();
  const r = await sql`INSERT INTO gym_sessions (user_id, week_start, day_label, focus) VALUES (${userId}, ${week_start}, ${day_label}, ${focus || ''}) RETURNING *`;
  return NextResponse.json(r[0]);
}
