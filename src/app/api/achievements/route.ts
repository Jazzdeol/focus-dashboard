import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET() {
  const sql = getDb(); const rows = await sql`SELECT * FROM achievements ORDER BY achieved_date DESC, created_at DESC`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const sql = getDb(); const { quarter, content } = await req.json();
  const r = await sql`INSERT INTO achievements (quarter, content) VALUES (${quarter || null}, ${content}) RETURNING *`; return NextResponse.json(r[0]);
}
