import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function POST(req: NextRequest) {
  const sql = getDb(); const { habit_id, date } = await req.json();
  const existing = await sql`SELECT id FROM habit_logs WHERE habit_id=${habit_id} AND logged_date=${date}`;
  if (existing.length) { await sql`DELETE FROM habit_logs WHERE habit_id=${habit_id} AND logged_date=${date}`; return NextResponse.json({ logged: false }); }
  await sql`INSERT INTO habit_logs (habit_id, logged_date) VALUES (${habit_id}, ${date}) ON CONFLICT DO NOTHING`;
  return NextResponse.json({ logged: true });
}
