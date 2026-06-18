import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const year = req.nextUrl.searchParams.get('year');
  const r = await sql`SELECT * FROM yearly_reflections WHERE user_id=${userId} AND year=${year}`;
  return NextResponse.json(r[0] || { q1: '', q2: '', q3: '', q4: '' });
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { year, q1, q2, q3, q4 } = await req.json();
  const r = await sql`INSERT INTO yearly_reflections (user_id, year, q1, q2, q3, q4) VALUES (${userId}, ${year}, ${q1}, ${q2}, ${q3}, ${q4})
    ON CONFLICT (user_id, year) DO UPDATE SET q1=${q1}, q2=${q2}, q3=${q3}, q4=${q4}, updated_at=NOW() RETURNING *`;
  return NextResponse.json(r[0]);
}
