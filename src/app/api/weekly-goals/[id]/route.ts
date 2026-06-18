import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); const b = await req.json();
  const r = await sql`UPDATE weekly_goals SET completed=${b.completed} WHERE id=${parseInt(params.id)} AND user_id=${userId} RETURNING *`; return NextResponse.json(r[0]);
}
export async function DELETE(_r: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const sql = getDb(); await sql`DELETE FROM weekly_goals WHERE id=${parseInt(params.id)} AND user_id=${userId}`; return NextResponse.json({ ok: true });
}
