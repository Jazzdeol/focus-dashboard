import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET() {
  const sql = getDb();
  const habits = await sql`SELECT * FROM habits ORDER BY section, sort_order, created_at`;
  const logs = await sql`SELECT habit_id, logged_date FROM habit_logs WHERE logged_date >= NOW() - INTERVAL '120 days'`;
  return NextResponse.json({ habits, logs });
}
export async function POST(req: NextRequest) {
  const sql = getDb(); const { name, icon, color, section, weekly_goal } = await req.json();
  const r = await sql`INSERT INTO habits (name, icon, color, section, weekly_goal)
    VALUES (${name}, ${icon || '✨'}, ${color || '#a78bfa'}, ${section || 'daily'}, ${weekly_goal || 7}) RETURNING *`;
  return NextResponse.json(r[0]);
}
