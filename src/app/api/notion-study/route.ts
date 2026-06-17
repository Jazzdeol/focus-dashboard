export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

// Reads the "Study Tracker" Notion database. Each row has Topic (title),
// Module (select), Subtopic (text) and Status (select). Returns them so the
// app can group by Module → Subtopic. Read-only: Notion is the master list.
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
      body: JSON.stringify({ page_size: 200 }),
    });
    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json({ configured: true, error: `Notion said: ${res.status}`, detail, items: [] });
    }
    const data = await res.json();
    type Prop = {
      title?: { plain_text: string }[];
      rich_text?: { plain_text: string }[];
      select?: { name: string } | null;
    };
    type NotionPage = { id: string; url: string; properties: Record<string, Prop> };

    const items = (data.results as NotionPage[]).map((p) => {
      const props = p.properties || {};
      const titleProp = Object.values(props).find((v) => Array.isArray(v.title));
      const title = titleProp?.title?.map((t) => t.plain_text).join('') || 'Untitled';
      const moduleName = props['Module']?.select?.name || 'Other';
      const subtopic = props['Subtopic']?.rich_text?.map((t) => t.plain_text).join('') || '';
      const status = props['Status']?.select?.name || '';
      return { id: p.id, title, module: moduleName, subtopic, status, done: status === 'Done', url: p.url };
    });
    return NextResponse.json({ configured: true, items });
  } catch {
    return NextResponse.json({ configured: true, error: 'Could not reach Notion', items: [] });
  }
}
