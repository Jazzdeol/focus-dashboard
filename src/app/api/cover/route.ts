import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET() {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const rows = await sql`SELECT * FROM cover_photos WHERE user_id=${userId} ORDER BY sort_order, created_at`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { image_data, caption, rotation } = await req.json();
  const r = await sql`INSERT INTO cover_photos (user_id, image_data, caption, rotation) VALUES (${userId}, ${image_data}, ${caption || ''}, ${rotation || 0}) RETURNING *`;
  return NextResponse.json(r[0]);
}
