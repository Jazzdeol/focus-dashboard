import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const date = req.nextUrl.searchParams.get('date');
  const rows = date ? await sql`SELECT * FROM food_logs WHERE user_id=${userId} AND log_date=${date} ORDER BY created_at`
    : await sql`SELECT * FROM food_logs WHERE user_id=${userId} ORDER BY created_at DESC LIMIT 50`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { log_date, food, calories, protein } = await req.json();
  const r = await sql`INSERT INTO food_logs (user_id, log_date, food, calories, protein) VALUES (${userId}, ${log_date}, ${food}, ${calories || 0}, ${protein || 0}) RETURNING *`;
  return NextResponse.json(r[0]);
}
