import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const sql = getDb();
  const tasks = await sql`SELECT * FROM tasks ORDER BY completed ASC, created_at DESC`;
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const sql = getDb();
  const { title, description, priority, due_date } = await req.json();
  const result = await sql`
    INSERT INTO tasks (title, description, priority, due_date)
    VALUES (${title}, ${description}, ${priority || 'medium'}, ${due_date || null})
    RETURNING *
  `;
  return NextResponse.json(result[0]);
}
