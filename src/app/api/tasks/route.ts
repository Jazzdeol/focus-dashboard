import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const week = req.nextUrl.searchParams.get('week');
  const rows = week
    ? await sql`SELECT * FROM tasks WHERE user_id=${userId} AND week_start=${week} ORDER BY completed, sort_order, created_at`
    : await sql`SELECT * FROM tasks WHERE user_id=${userId} ORDER BY completed, sort_order, created_at`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { title, week_start, category } = await req.json();
  const r = await sql`INSERT INTO tasks (user_id, title, week_start, category) VALUES (${userId}, ${title}, ${week_start || null}, ${category || 'general'}) RETURNING *`;
  return NextResponse.json(r[0]);
}
