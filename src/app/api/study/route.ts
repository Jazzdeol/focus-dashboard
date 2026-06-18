import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET() {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const rows = await sql`SELECT * FROM study_items WHERE user_id=${userId} ORDER BY completed, subject, created_at`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { subject, title, task_type, notion_url } = await req.json();
  const r = await sql`INSERT INTO study_items (user_id, subject, title, task_type, notion_url) VALUES (${userId}, ${subject}, ${title}, ${task_type || 'notes'}, ${notion_url || null}) RETURNING *`;
  return NextResponse.json(r[0]);
}
