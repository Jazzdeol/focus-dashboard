import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET(req: NextRequest) {
  const sql = getDb(); const q = req.nextUrl.searchParams.get('quarter');
  const rows = await sql`SELECT * FROM quarterly_goals WHERE quarter=${q} ORDER BY created_at`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const sql = getDb(); const { quarter, goal } = await req.json();
  const r = await sql`INSERT INTO quarterly_goals (quarter, goal) VALUES (${quarter}, ${goal}) RETURNING *`; return NextResponse.json(r[0]);
}
