import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET(req: NextRequest) {
  const sql = getDb();
  const week = req.nextUrl.searchParams.get('week');
  const rows = week
    ? await sql`SELECT * FROM tasks WHERE week_start = ${week} ORDER BY completed, sort_order, created_at`
    : await sql`SELECT * FROM tasks ORDER BY completed, sort_order, created_at`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const sql = getDb(); const { title, week_start, category } = await req.json();
  const r = await sql`INSERT INTO tasks (title, week_start, category) VALUES (${title}, ${week_start || null}, ${category || 'general'}) RETURNING *`;
  return NextResponse.json(r[0]);
}
