export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
import { getValidAccessToken } from '@/lib/integrations';

export async function GET() {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const token = await getValidAccessToken(userId, 'notion');
  if (!token) return NextResponse.json({ databases: [] });
  try {
    const res = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
      body: JSON.stringify({ filter: { property: 'object', value: 'database' }, page_size: 100 }),
    });
    if (!res.ok) return NextResponse.json({ databases: [] });
    const data = await res.json();
    type DB = { id: string; title?: { plain_text: string }[] };
    const databases = (data.results as DB[]).map((d) => ({
      id: d.id,
      title: d.title?.map((t) => t.plain_text).join('') || 'Untitled database',
    }));
    return NextResponse.json({ databases });
  } catch {
    return NextResponse.json({ databases: [] });
  }
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const { database_id } = await req.json();
  const sql = getDb();
  await sql`UPDATE integration_accounts
    SET metadata = COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify({ database_id })}::jsonb, updated_at=NOW()
    WHERE user_id=${userId} AND provider='notion'`;
  return NextResponse.json({ ok: true });
}
