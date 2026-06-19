import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const b = await req.json(); const id = parseInt(params.id);
  if ('caught_up' in b) { const r = await sql`UPDATE relationships SET last_caught_up=CURRENT_DATE WHERE id=${id} AND user_id=${userId} RETURNING *`; return NextResponse.json(r[0]); }
  const r = await sql`UPDATE relationships SET name=COALESCE(${b.name ?? null}, name), birthday=COALESCE(${b.birthday ?? null}, birthday), cadence_days=COALESCE(${b.cadence_days ?? null}, cadence_days), notes=COALESCE(${b.notes ?? null}, notes) WHERE id=${id} AND user_id=${userId} RETURNING *`;
  return NextResponse.json(r[0]);
}
export async function DELETE(_r: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); await sql`DELETE FROM relationships WHERE id=${parseInt(params.id)} AND user_id=${userId}`; return NextResponse.json({ ok: true });
}
