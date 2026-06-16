import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET() {
  const sql = getDb(); const rows = await sql`SELECT * FROM cover_photos ORDER BY sort_order, created_at`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const sql = getDb(); const { image_data, caption, rotation } = await req.json();
  const r = await sql`INSERT INTO cover_photos (image_data, caption, rotation) VALUES (${image_data}, ${caption || ''}, ${rotation || 0}) RETURNING *`;
  return NextResponse.json(r[0]);
}
