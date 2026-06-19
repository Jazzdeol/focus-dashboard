import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET() {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb();
  const rows = await sql`SELECT * FROM relationships WHERE user_id=${userId} ORDER BY name`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { name, birthday, cadence_days, notes } = await req.json();
  const r = await sql`INSERT INTO relationships (user_id, name, birthday, cadence_days, notes)
    VALUES (${userId}, ${name}, ${birthday || null}, ${cadence_days || 30}, ${notes || ''}) RETURNING *`;
  return NextResponse.json(r[0]);
}
