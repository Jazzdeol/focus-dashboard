import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';
export async function POST() {
  try { await initDb(); return NextResponse.json({ ok: true }); }
  catch (e) { console.error(e); return NextResponse.json({ error: 'init failed' }, { status: 500 }); }
}
