import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const sql = getDb();
  const notes = await sql`SELECT * FROM notes ORDER BY pinned DESC, updated_at DESC`;
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const sql = getDb();
  const { title, content } = await req.json();
  const result = await sql`
    INSERT INTO notes (title, content) VALUES (${title}, ${content || ''}) RETURNING *
  `;
  return NextResponse.json(result[0]);
}
