import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  const sql = getDb();
  const { habit_id, date, toggle } = await req.json();

  if (toggle) {
    const existing = await sql`
      SELECT id FROM habit_logs WHERE habit_id = ${habit_id} AND logged_date = ${date}
    `;
    if (existing.length > 0) {
      await sql`DELETE FROM habit_logs WHERE habit_id = ${habit_id} AND logged_date = ${date}`;
      return NextResponse.json({ logged: false });
    }
  }

  await sql`
    INSERT INTO habit_logs (habit_id, logged_date) VALUES (${habit_id}, ${date})
    ON CONFLICT (habit_id, logged_date) DO NOTHING
  `;
  return NextResponse.json({ logged: true });
}
