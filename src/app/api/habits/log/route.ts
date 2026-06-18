import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { habit_id, date } = await req.json();
  // make sure this habit belongs to the user
  const own = await sql`SELECT id FROM habits WHERE id=${habit_id} AND user_id=${userId}`;
  if (!own.length) return unauthorized();
  const existing = await sql`SELECT id FROM habit_logs WHERE habit_id=${habit_id} AND logged_date=${date} AND user_id=${userId}`;
  if (existing.length) { await sql`DELETE FROM habit_logs WHERE habit_id=${habit_id} AND logged_date=${date} AND user_id=${userId}`; return NextResponse.json({ logged: false }); }
  await sql`INSERT INTO habit_logs (user_id, habit_id, logged_date) VALUES (${userId}, ${habit_id}, ${date}) ON CONFLICT DO NOTHING`;
  return NextResponse.json({ logged: true });
}
