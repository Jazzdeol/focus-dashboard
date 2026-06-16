import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET(req: NextRequest) {
  const sql = getDb(); const week = req.nextUrl.searchParams.get('week');
  const r = await sql`SELECT * FROM weekly_reflections WHERE week_start=${week}`;
  return NextResponse.json(r[0] || { content: '' });
}
export async function POST(req: NextRequest) {
  const sql = getDb(); const { week_start, content } = await req.json();
  const r = await sql`INSERT INTO weekly_reflections (week_start, content) VALUES (${week_start}, ${content})
    ON CONFLICT (week_start) DO UPDATE SET content=${content}, updated_at=NOW() RETURNING *`;
  return NextResponse.json(r[0]);
}
