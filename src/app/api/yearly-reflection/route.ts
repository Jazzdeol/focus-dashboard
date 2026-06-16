import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET(req: NextRequest) {
  const sql = getDb(); const year = req.nextUrl.searchParams.get('year');
  const r = await sql`SELECT * FROM yearly_reflections WHERE year=${year}`;
  return NextResponse.json(r[0] || { q1: '', q2: '', q3: '', q4: '' });
}
export async function POST(req: NextRequest) {
  const sql = getDb(); const { year, q1, q2, q3, q4 } = await req.json();
  const r = await sql`INSERT INTO yearly_reflections (year, q1, q2, q3, q4) VALUES (${year}, ${q1}, ${q2}, ${q3}, ${q4})
    ON CONFLICT (year) DO UPDATE SET q1=${q1}, q2=${q2}, q3=${q3}, q4=${q4}, updated_at=NOW() RETURNING *`;
  return NextResponse.json(r[0]);
}
