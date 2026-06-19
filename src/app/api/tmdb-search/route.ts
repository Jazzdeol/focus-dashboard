export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUserId, unauthorized } from '@/lib/auth';

// Movie/TV search via TMDb. Uses a single shared key (TMDB_API_KEY) — it's public catalogue data.
export async function GET(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const q = req.nextUrl.searchParams.get('q');
  if (!q || !q.trim()) return NextResponse.json([]);
  const key = process.env.TMDB_API_KEY;
  if (!key) return NextResponse.json({ error: 'not_configured' }, { status: 200 });
  try {
    const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${key}&query=${encodeURIComponent(q)}&include_adult=false&page=1`);
    if (!res.ok) return NextResponse.json([]);
    const data = await res.json();
    type R = { id: number; media_type: string; title?: string; name?: string; release_date?: string; first_air_date?: string; poster_path?: string | null };
    const items = (data.results as R[])
      .filter(r => r.media_type === 'movie' || r.media_type === 'tv')
      .slice(0, 14)
      .map(r => ({
        tmdb_id: String(r.id),
        media_type: r.media_type,
        title: r.title || r.name || 'Untitled',
        year: (r.release_date || r.first_air_date || '').slice(0, 4),
        poster: r.poster_path ? `https://image.tmdb.org/t/p/w200${r.poster_path}` : null,
      }));
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}
