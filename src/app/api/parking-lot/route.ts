import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET() {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const rows = await sql`SELECT * FROM parking_lot WHERE user_id=${userId} AND archived=FALSE ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { content } = await req.json();
  const r = await sql`INSERT INTO parking_lot (user_id, content) VALUES (${userId}, ${content}) RETURNING *`; return NextResponse.json(r[0]);
}
