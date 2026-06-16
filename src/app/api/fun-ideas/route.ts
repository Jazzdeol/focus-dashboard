import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET() {
  const sql = getDb(); const rows = await sql`SELECT * FROM fun_ideas ORDER BY done, created_at DESC`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const sql = getDb(); const { content } = await req.json();
  const r = await sql`INSERT INTO fun_ideas (content) VALUES (${content}) RETURNING *`; return NextResponse.json(r[0]);
}
