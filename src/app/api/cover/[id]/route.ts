import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sql = getDb(); const b = await req.json();
  const r = await sql`UPDATE cover_photos SET caption=${b.caption} WHERE id=${parseInt(params.id)} RETURNING *`; return NextResponse.json(r[0]);
}
export async function DELETE(_r: NextRequest, { params }: { params: { id: string } }) {
  const sql = getDb(); await sql`DELETE FROM cover_photos WHERE id=${parseInt(params.id)}`; return NextResponse.json({ ok: true });
}
