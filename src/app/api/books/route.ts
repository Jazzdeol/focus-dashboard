import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET() {
  const sql = getDb();
  const rows = await sql`SELECT * FROM books ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const sql = getDb(); const { title, author, cover_id, status } = await req.json();
  const r = await sql`INSERT INTO books (title, author, cover_id, status) VALUES (${title}, ${author || ''}, ${cover_id || null}, ${status || 'want'}) RETURNING *`;
  return NextResponse.json(r[0]);
}
