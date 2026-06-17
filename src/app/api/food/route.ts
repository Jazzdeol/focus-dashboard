import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET(req: NextRequest) {
  const sql = getDb(); const date = req.nextUrl.searchParams.get('date');
  const rows = date ? await sql`SELECT * FROM food_logs WHERE log_date=${date} ORDER BY created_at`
    : await sql`SELECT * FROM food_logs ORDER BY created_at DESC LIMIT 50`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const sql = getDb(); const { log_date, food, calories, protein } = await req.json();
  const r = await sql`INSERT INTO food_logs (log_date, food, calories, protein) VALUES (${log_date}, ${food}, ${calories || 0}, ${protein || 0}) RETURNING *`;
  return NextResponse.json(r[0]);
}
