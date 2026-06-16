import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const sql = getDb();
  const sessions = await sql`
    SELECT * FROM focus_sessions WHERE completed_at >= NOW() - INTERVAL '7 days' ORDER BY completed_at DESC
  `;
  const total = await sql`
    SELECT COALESCE(SUM(duration_minutes), 0) as total FROM focus_sessions WHERE completed_at >= NOW() - INTERVAL '7 days'
  `;
  return NextResponse.json({ sessions, weeklyTotal: total[0].total });
}

export async function POST(req: NextRequest) {
  const sql = getDb();
  const { duration_minutes, label } = await req.json();
  const result = await sql`
    INSERT INTO focus_sessions (duration_minutes, label) VALUES (${duration_minutes}, ${label || null}) RETURNING *
  `;
  return NextResponse.json(result[0]);
}
