import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET() {
  const sql = getDb(); const rows = await sql`SELECT * FROM study_items ORDER BY completed, subject, created_at`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const sql = getDb(); const { subject, title, task_type, notion_url } = await req.json();
  const r = await sql`INSERT INTO study_items (subject, title, task_type, notion_url) VALUES (${subject}, ${title}, ${task_type || 'notes'}, ${notion_url || null}) RETURNING *`;
  return NextResponse.json(r[0]);
}
