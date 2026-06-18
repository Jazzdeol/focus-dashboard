import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb();
  const week = req.nextUrl.searchParams.get('week');
  const prev = req.nextUrl.searchParams.get('prev');
  const rows = await sql`SELECT * FROM gym_weight_logs WHERE user_id=${userId} AND week_start IN (${week}, ${prev})`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { exercise_id, week_start, weight, reps, sets } = await req.json();
  const own = await sql`SELECT id FROM gym_exercises WHERE id=${exercise_id} AND user_id=${userId}`;
  if (!own.length) return unauthorized();
  const existing = await sql`SELECT id FROM gym_weight_logs WHERE exercise_id=${exercise_id} AND week_start=${week_start} AND user_id=${userId}`;
  if (existing.length) {
    const r = await sql`UPDATE gym_weight_logs SET weight=${weight}, reps=${reps || null}, sets=${sets || null}, updated_at=NOW() WHERE id=${existing[0].id} RETURNING *`;
    return NextResponse.json(r[0]);
  }
  const r = await sql`INSERT INTO gym_weight_logs (user_id, exercise_id, week_start, weight, reps, sets) VALUES (${userId}, ${exercise_id}, ${week_start}, ${weight}, ${reps || null}, ${sets || null}) RETURNING *`;
  return NextResponse.json(r[0]);
}
