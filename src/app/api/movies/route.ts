import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET() {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb();
  const rows = await sql`SELECT * FROM movies WHERE user_id=${userId} ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { tmdb_id, media_type, title, year, poster, status } = await req.json();
  const r = await sql`INSERT INTO movies (user_id, tmdb_id, media_type, title, year, poster, status)
    VALUES (${userId}, ${tmdb_id || null}, ${media_type || 'movie'}, ${title}, ${year || ''}, ${poster || null}, ${status || 'want'}) RETURNING *`;
  return NextResponse.json(r[0]);
}
