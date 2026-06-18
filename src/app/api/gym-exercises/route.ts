import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET() {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb();
  const rows = await sql`SELECT * FROM gym_exercises WHERE user_id=${userId} ORDER BY sort_order, created_at`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { name } = await req.json();
  const r = await sql`INSERT INTO gym_exercises (user_id, name) VALUES (${userId}, ${name}) RETURNING *`;
  return NextResponse.json(r[0]);
}
