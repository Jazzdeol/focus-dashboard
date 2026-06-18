import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const q = req.nextUrl.searchParams.get('quarter');
  const rows = await sql`SELECT * FROM finances WHERE user_id=${userId} AND quarter=${q} ORDER BY created_at`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { quarter, label, amount, kind } = await req.json();
  const r = await sql`INSERT INTO finances (user_id, quarter, label, amount, kind) VALUES (${userId}, ${quarter}, ${label}, ${amount}, ${kind}) RETURNING *`;
  return NextResponse.json(r[0]);
}
