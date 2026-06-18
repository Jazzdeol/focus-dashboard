import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET() {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb();
  const rows = await sql`SELECT * FROM books WHERE user_id=${userId} ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { title, author, cover_id, status } = await req.json();
  const r = await sql`INSERT INTO books (user_id, title, author, cover_id, status) VALUES (${userId}, ${title}, ${author || ''}, ${cover_id || null}, ${status || 'want'}) RETURNING *`;
  return NextResponse.json(r[0]);
}
