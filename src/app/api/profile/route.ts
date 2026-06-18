import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET() {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb();
  const r = await sql`SELECT * FROM profiles WHERE user_id=${userId}`;
  return NextResponse.json(r[0] || null);
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { weight, height, age, sex, activity } = await req.json();
  const r = await sql`INSERT INTO profiles (user_id, weight, height, age, sex, activity)
    VALUES (${userId}, ${weight}, ${height}, ${age}, ${sex}, ${activity})
    ON CONFLICT (user_id) DO UPDATE SET weight=${weight}, height=${height}, age=${age}, sex=${sex}, activity=${activity}, updated_at=NOW()
    RETURNING *`;
  return NextResponse.json(r[0]);
}
