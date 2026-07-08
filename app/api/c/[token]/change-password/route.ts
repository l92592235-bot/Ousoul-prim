import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthedClient } from '@/lib/auth';
import { verifyPassword, hashPassword } from '@/lib/crypto';

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const client = await getAuthedClient(params.token);
  if (!client) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const currentPassword = (body?.currentPassword || '').toString();
  const newPassword = (body?.newPassword || '').toString();

  if (!client.password_hash || !verifyPassword(currentPassword, client.password_hash)) {
    return NextResponse.json({ error: 'wrong_current' }, { status: 401 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'password_length' }, { status: 400 });
  }

  const newHash = hashPassword(newPassword);
  await sql`UPDATE clients SET password_hash = ${newHash} WHERE id = ${client.id}`;
  return NextResponse.json({ ok: true });
}
