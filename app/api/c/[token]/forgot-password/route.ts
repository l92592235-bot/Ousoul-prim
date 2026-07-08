import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getClientByToken } from '@/lib/auth';

export async function POST(_req: NextRequest, { params }: { params: { token: string } }) {
  const client = await getClientByToken(params.token);
  if (!client || !client.setup_complete) {
    // Do not reveal whether the account exists.
    return NextResponse.json({ ok: true });
  }
  await sql`INSERT INTO password_reset_requests (client_id, status) VALUES (${client.id}, 'pending')`;
  return NextResponse.json({ ok: true });
}
