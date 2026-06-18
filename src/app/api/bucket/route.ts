import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET() {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const rows = await sql`SELECT * FROM bucket_list WHERE user_id=${userId} ORDER BY completed, created_at`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { category, item, notes } = await req.json();
  const r = await sql`INSERT INTO bucket_list (user_id, category, item, notes) VALUES (${userId}, ${category}, ${item}, ${notes || ''}) RETURNING *`;
  return NextResponse.json(r[0]);
}
