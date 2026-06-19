export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
import { getValidAccessToken } from '@/lib/integrations';

function readMeta(m: unknown): Record<string, unknown> {
  if (!m) return {};
  if (typeof m === 'string') { try { return JSON.parse(m); } catch { return {}; } }
  return m as Record<string, unknown>;
}

export async function GET() {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const token = await getValidAccessToken(userId, 'notion');
  if (!token) return NextResponse.json({ configured: false, items: [] });

  const sql = getDb();
  const rows = await sql`SELECT metadata FROM integration_accounts WHERE user_id=${userId} AND provider='notion'`;
  const meta = readMeta(rows[0]?.metadata);
  const dbId = meta.database_id as string | undefined;
  if (!dbId) return NextResponse.json({ configured: true, needsDatabase: true, items: [] });

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_size: 200 }),
    });
    if (!res.ok) {
      if (res.status === 404) return NextResponse.json({ configured: true, needsDatabase: true, items: [], error: 'lost_access' });
      return NextResponse.json({ configured: true, error: `Notion said ${res.status}`, items: [] });
    }
    const data = await res.json();
    type Prop = { type: string; title?: { plain_text: string }[]; rich_text?: { plain_text: string }[]; select?: { name: string } | null; status?: { name: string } | null };
    type Page = { id: string; url: string; properties: Record<string, Prop> };

    const items = (data.results as Page[]).map((p) => {
      const props = p.properties || {};
      const titleProp = Object.values(props).find((v) => v.type === 'title');
      const title = titleProp?.title?.map((t) => t.plain_text).join('') || 'Untitled';
      // pick named props if present, else best-guess
      const moduleName = props['Module']?.select?.name || '';
      const subtopic = props['Subtopic']?.rich_text?.map((t) => t.plain_text).join('')
        || props['Subtopic']?.select?.name || '';
      const statusProp = props['Status'] || Object.values(props).find((v) => v.type === 'status' || v.type === 'select');
      const status = statusProp?.select?.name || statusProp?.status?.name || '';
      return { id: p.id, title, module: moduleName, subtopic, status, done: status === 'Done', url: p.url };
    });
    return NextResponse.json({ configured: true, items });
  } catch {
    return NextResponse.json({ configured: true, error: 'Could not reach Notion', items: [] });
  }
}
