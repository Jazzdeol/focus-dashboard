import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const sql = getDb();
  const habits = await sql`SELECT * FROM habits ORDER BY created_at ASC`;
  const today = new Date().toISOString().split('T')[0];
  
  const logs = await sql`
    SELECT habit_id, logged_date FROM habit_logs 
    WHERE logged_date >= NOW() - INTERVAL '30 days'
  `;

  return NextResponse.json({ habits, logs, today });
}

export async function POST(req: NextRequest) {
  const sql = getDb();
  const { name, icon, color } = await req.json();
  const result = await sql`
    INSERT INTO habits (name, icon, color) VALUES (${name}, ${icon || '✨'}, ${color || '#6366f1'}) RETURNING *
  `;
  return NextResponse.json(result[0]);
}
