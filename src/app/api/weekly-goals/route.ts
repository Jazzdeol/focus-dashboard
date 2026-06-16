import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET(req: NextRequest) {
  const sql = getDb(); const week = req.nextUrl.searchParams.get('week');
  const rows = await sql`SELECT * FROM weekly_goals WHERE week_start=${week} ORDER BY created_at`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const sql = getDb(); const { week_start, goal } = await req.json();
  const r = await sql`INSERT INTO weekly_goals (week_start, goal) VALUES (${week_start}, ${goal}) RETURNING *`;
  return NextResponse.json(r[0]);
}
