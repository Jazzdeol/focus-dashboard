import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET() {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const rows = await sql`SELECT * FROM achievements WHERE user_id=${userId} ORDER BY achieved_date DESC, created_at DESC`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { quarter, content } = await req.json();
  const r = await sql`INSERT INTO achievements (user_id, quarter, content) VALUES (${userId}, ${quarter || null}, ${content}) RETURNING *`; return NextResponse.json(r[0]);
}
