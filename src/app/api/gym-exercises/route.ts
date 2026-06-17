import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET() {
  const sql = getDb();
  const rows = await sql`SELECT * FROM gym_exercises ORDER BY sort_order, created_at`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const sql = getDb(); const { name } = await req.json();
  const r = await sql`INSERT INTO gym_exercises (name) VALUES (${name}) RETURNING *`;
  return NextResponse.json(r[0]);
}
