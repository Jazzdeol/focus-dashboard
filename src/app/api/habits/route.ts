import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET() {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb();
  const habits = await sql`SELECT * FROM habits WHERE user_id=${userId} ORDER BY section, sort_order, created_at`;
  const logs = await sql`SELECT habit_id, logged_date FROM habit_logs WHERE user_id=${userId} AND logged_date >= NOW() - INTERVAL '120 days'`;
  return NextResponse.json({ habits, logs });
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { name, icon, color, section, weekly_goal } = await req.json();
  const r = await sql`INSERT INTO habits (user_id, name, icon, color, section, weekly_goal)
    VALUES (${userId}, ${name}, ${icon || '✨'}, ${color || '#a78bfa'}, ${section || 'daily'}, ${weekly_goal || 7}) RETURNING *`;
  return NextResponse.json(r[0]);
}
