import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const year = req.nextUrl.searchParams.get('year');
  const rows = await sql`SELECT * FROM yearly_goals WHERE user_id=${userId} AND year=${year} ORDER BY created_at`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { year, goal } = await req.json();
  const r = await sql`INSERT INTO yearly_goals (user_id, year, goal) VALUES (${userId}, ${year}, ${goal}) RETURNING *`; return NextResponse.json(r[0]);
}
