import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function POST() {
  try {
    await initDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({ error: 'Failed to init db' }, { status: 500 });
  }
}
