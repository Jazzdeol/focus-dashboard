export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

// Optional Notion sync. If NOTION_TOKEN and NOTION_DATABASE_ID are set as env vars,
// this pulls items from a Notion database. Otherwise returns a not-configured flag
// so the Study view falls back to the manual checklist.
export async function GET() {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_DATABASE_ID;
  if (!token || !dbId) return NextResponse.json({ configured: false, items: [] });

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_size: 100 }),
    });
    if (!res.ok) return NextResponse.json({ configured: true, error: 'Notion request failed', items: [] });
    const data = await res.json();
    type NotionPage = { id: string; url: string; properties: Record<string, { title?: { plain_text: string }[]; checkbox?: boolean; select?: { name: string } | null }> };
    const items = (data.results as NotionPage[]).map((p) => {
      const props = p.properties || {};
      const titleProp = Object.values(props).find((v) => Array.isArray(v.title));
      const title = titleProp?.title?.map((t) => t.plain_text).join('') || 'Untitled';
      const statusProp = Object.values(props).find((v) => v.select);
      const checkProp = Object.values(props).find((v) => typeof v.checkbox === 'boolean');
      return {
        id: p.id,
        title,
        status: statusProp?.select?.name || '',
        done: checkProp?.checkbox ?? false,
        url: p.url,
      };
    });
    return NextResponse.json({ configured: true, items });
  } catch {
    return NextResponse.json({ configured: true, error: 'Notion fetch error', items: [] });
  }
}
