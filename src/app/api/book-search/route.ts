export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUserId, unauthorized } from '@/lib/auth';
export async function GET(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const q = req.nextUrl.searchParams.get('q');
  if (!q || !q.trim()) return NextResponse.json([]);
  try {
    const res = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(q)}&limit=12&fields=title,author_name,cover_i,key,first_publish_year`);
    if (!res.ok) return NextResponse.json([]);
    const data = await res.json();
    type Doc = { title: string; author_name?: string[]; cover_i?: number; key: string; first_publish_year?: number };
    const books = (data.docs as Doc[]).map((d) => ({
      title: d.title,
      author: d.author_name?.[0] || 'Unknown',
      cover_id: d.cover_i ? String(d.cover_i) : null,
      year: d.first_publish_year || null,
      key: d.key,
    }));
    return NextResponse.json(books);
  } catch {
    return NextResponse.json([]);
  }
}
