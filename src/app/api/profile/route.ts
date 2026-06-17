import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET() {
  const sql = getDb();
  const r = await sql`SELECT * FROM profile WHERE id=1`;
  return NextResponse.json(r[0] || null);
}
export async function POST(req: NextRequest) {
  const sql = getDb(); const { weight, height, age, sex, activity } = await req.json();
  const r = await sql`INSERT INTO profile (id, weight, height, age, sex, activity)
    VALUES (1, ${weight}, ${height}, ${age}, ${sex}, ${activity})
    ON CONFLICT (id) DO UPDATE SET weight=${weight}, height=${height}, age=${age}, sex=${sex}, activity=${activity}, updated_at=NOW()
    RETURNING *`;
  return NextResponse.json(r[0]);
}
