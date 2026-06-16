import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sql = getDb(); const b = await req.json();
  const r = await sql`UPDATE study_items SET completed=${b.completed} WHERE id=${parseInt(params.id)} RETURNING *`; return NextResponse.json(r[0]);
}
export async function DELETE(_r: NextRequest, { params }: { params: { id: string } }) {
  const sql = getDb(); await sql`DELETE FROM study_items WHERE id=${parseInt(params.id)}`; return NextResponse.json({ ok: true });
}
