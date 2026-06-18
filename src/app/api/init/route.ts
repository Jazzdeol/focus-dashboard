import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function POST() {
  const userId = await getUserId(); if (!userId) return unauthorized();
  try { await initDb(); return NextResponse.json({ ok: true }); }
  catch (e) { console.error(e); return NextResponse.json({ error: 'init failed' }, { status: 500 }); }
}
