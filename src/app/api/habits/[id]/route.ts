import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const sql = getDb();
  await sql`DELETE FROM habits WHERE id = ${parseInt(params.id)}`;
  return NextResponse.json({ success: true });
}
