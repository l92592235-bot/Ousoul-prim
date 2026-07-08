import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { isAdminAuthorized } from '@/lib/admin';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const id = Number(params.id);
  await sql`DELETE FROM clients WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
