import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function DELETE(_r: NextRequest, { params }: { params: { id: string } }) {
  const sql = getDb(); await sql`DELETE FROM food_logs WHERE id=${parseInt(params.id)}`; return NextResponse.json({ ok: true });
}
