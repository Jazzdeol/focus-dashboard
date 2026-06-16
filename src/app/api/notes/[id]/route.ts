import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sql = getDb();
  const id = parseInt(params.id);
  const body = await req.json();

  if ('pinned' in body && Object.keys(body).length === 1) {
    const result = await sql`UPDATE notes SET pinned = ${body.pinned}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
    return NextResponse.json(result[0]);
  }

  const { title, content } = body;
  const result = await sql`
    UPDATE notes SET title = ${title}, content = ${content}, updated_at = NOW() WHERE id = ${id} RETURNING *
  `;
  return NextResponse.json(result[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const sql = getDb();
  await sql`DELETE FROM notes WHERE id = ${parseInt(params.id)}`;
  return NextResponse.json({ success: true });
}
