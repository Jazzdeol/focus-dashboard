import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET(req: NextRequest) {
  const sql = getDb(); const year = req.nextUrl.searchParams.get('year');
  const rows = year ? await sql`SELECT * FROM places_visited WHERE year=${year} ORDER BY created_at`
    : await sql`SELECT * FROM places_visited ORDER BY created_at`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const sql = getDb(); const { name, year } = await req.json();
  const r = await sql`INSERT INTO places_visited (name, year) VALUES (${name}, ${year}) RETURNING *`;
  return NextResponse.json(r[0]);
}
