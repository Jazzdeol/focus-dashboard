import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sql = getDb();
  const body = await req.json();
  const id = parseInt(params.id);

  if ('completed' in body) {
    const result = await sql`
      UPDATE tasks SET completed = ${body.completed}, updated_at = NOW() WHERE id = ${id} RETURNING *
    `;
    return NextResponse.json(result[0]);
  }

  const { title, description, priority, due_date } = body;
  const result = await sql`
    UPDATE tasks SET title = ${title}, description = ${description}, priority = ${priority}, due_date = ${due_date || null}, updated_at = NOW()
    WHERE id = ${id} RETURNING *
  `;
  return NextResponse.json(result[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const sql = getDb();
  await sql`DELETE FROM tasks WHERE id = ${parseInt(params.id)}`;
  return NextResponse.json({ success: true });
}
