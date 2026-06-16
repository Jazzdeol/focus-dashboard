import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET(req: NextRequest) {
  const sql = getDb(); const year = req.nextUrl.searchParams.get('year');
  const rows = await sql`SELECT * FROM yearly_goals WHERE year=${year} ORDER BY created_at`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const sql = getDb(); const { year, goal } = await req.json();
  const r = await sql`INSERT INTO yearly_goals (year, goal) VALUES (${year}, ${goal}) RETURNING *`; return NextResponse.json(r[0]);
}
