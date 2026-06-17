import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET(req: NextRequest) {
  const sql = getDb();
  const week = req.nextUrl.searchParams.get('week');
  const prev = req.nextUrl.searchParams.get('prev');
  // return logs for this week and the previous week (for the colour reference)
  const rows = await sql`SELECT * FROM gym_weight_logs WHERE week_start IN (${week}, ${prev})`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const sql = getDb(); const { exercise_id, week_start, weight, reps, sets } = await req.json();
  const r = await sql`INSERT INTO gym_weight_logs (exercise_id, week_start, weight, reps, sets)
    VALUES (${exercise_id}, ${week_start}, ${weight}, ${reps || null}, ${sets || null})
    ON CONFLICT (exercise_id, week_start) DO UPDATE SET weight=${weight}, reps=${reps || null}, sets=${sets || null}, updated_at=NOW()
    RETURNING *`;
  return NextResponse.json(r[0]);
}
