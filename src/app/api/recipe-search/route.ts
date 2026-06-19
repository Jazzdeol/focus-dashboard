export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUserId, unauthorized } from '@/lib/auth';

// Recipe search via Spoonacular. Single shared key (SPOONACULAR_API_KEY); has a daily quota.
export async function GET(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const q = req.nextUrl.searchParams.get('q');
  if (!q || !q.trim()) return NextResponse.json([]);
  const key = process.env.SPOONACULAR_API_KEY;
  if (!key) return NextResponse.json({ error: 'not_configured' }, { status: 200 });
  try {
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(q)}&number=12&addRecipeInformation=true&apiKey=${key}`;
    const res = await fetch(url);
    if (res.status === 402) return NextResponse.json({ error: 'quota' }, { status: 200 });
    if (!res.ok) return NextResponse.json([]);
    const data = await res.json();
    type R = { id: number; title: string; image?: string; sourceUrl?: string; readyInMinutes?: number; servings?: number };
    const items = (data.results as R[] || []).map(r => ({
      spoonacular_id: String(r.id),
      title: r.title,
      image: r.image || null,
      source_url: r.sourceUrl || null,
      ready_minutes: r.readyInMinutes || null,
      servings: r.servings || null,
    }));
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}
