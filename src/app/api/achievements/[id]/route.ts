import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function DELETE(_r: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); await sql`DELETE FROM achievements WHERE id=${parseInt(params.id)} AND user_id=${userId}`; return NextResponse.json({ ok: true });
}
