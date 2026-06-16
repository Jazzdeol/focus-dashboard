import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET() {
  const sql = getDb(); const rows = await sql`SELECT * FROM bucket_list ORDER BY completed, created_at`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const sql = getDb(); const { category, item, notes } = await req.json();
  const r = await sql`INSERT INTO bucket_list (category, item, notes) VALUES (${category}, ${item}, ${notes || ''}) RETURNING *`;
  return NextResponse.json(r[0]);
}
