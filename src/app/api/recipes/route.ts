import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET() {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb();
  const rows = await sql`SELECT * FROM recipes WHERE user_id=${userId} ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const { spoonacular_id, title, image, source_url, ready_minutes, servings } = await req.json();
  const r = await sql`INSERT INTO recipes (user_id, spoonacular_id, title, image, source_url, ready_minutes, servings)
    VALUES (${userId}, ${spoonacular_id || null}, ${title}, ${image || null}, ${source_url || null}, ${ready_minutes || null}, ${servings || null}) RETURNING *`;
  return NextResponse.json(r[0]);
}
