import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const week = req.nextUrl.searchParams.get('week');
  const r = await sql`SELECT * FROM weekly_reflections WHERE user_id=${userId} AND week_start=${week}`;
  return NextResponse.json(r[0] || { content: '' });
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { week_start, content } = await req.json();
  const r = await sql`INSERT INTO weekly_reflections (user_id, week_start, content) VALUES (${userId}, ${week_start}, ${content})
    ON CONFLICT (user_id, week_start) DO UPDATE SET content=${content}, updated_at=NOW() RETURNING *`;
  return NextResponse.json(r[0]);
}
