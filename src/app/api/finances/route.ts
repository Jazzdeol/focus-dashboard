import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET(req: NextRequest) {
  const sql = getDb(); const q = req.nextUrl.searchParams.get('quarter');
  const rows = await sql`SELECT * FROM finances WHERE quarter=${q} ORDER BY created_at`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const sql = getDb(); const { quarter, label, amount, kind } = await req.json();
  const r = await sql`INSERT INTO finances (quarter, label, amount, kind) VALUES (${quarter}, ${label}, ${amount}, ${kind}) RETURNING *`;
  return NextResponse.json(r[0]);
}
