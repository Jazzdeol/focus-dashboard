import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const year = req.nextUrl.searchParams.get('year');
  const rows = year ? await sql`SELECT * FROM places_visited WHERE user_id=${userId} AND year=${year} ORDER BY created_at`
    : await sql`SELECT * FROM places_visited WHERE user_id=${userId} ORDER BY created_at`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { name, year } = await req.json();
  const r = await sql`INSERT INTO places_visited (user_id, name, year) VALUES (${userId}, ${name}, ${year}) RETURNING *`;
  return NextResponse.json(r[0]);
}
