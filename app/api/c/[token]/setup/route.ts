import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getClientByToken, createSession } from '@/lib/auth';
import { hashPassword } from '@/lib/crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const client = await getClientByToken(params.token);
  if (!client) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (client.setup_complete) return NextResponse.json({ error: 'already_setup' }, { status: 409 });

  const body = await req.json().catch(() => null);
  const fullName = (body?.fullName || '').toString().trim();
  const email = (body?.email || '').toString().trim();
  const whatsapp = (body?.whatsapp || '').toString().trim();
  const password = (body?.password || '').toString();

  if (!fullName || !email || !password) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'password_length' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  const passwordHash = hashPassword(password);
  await sql`
    UPDATE clients SET
      full_name = ${fullName},
      email = ${email},
      whatsapp = ${whatsapp || null},
      password_hash = ${passwordHash},
      setup_complete = TRUE,
      failed_login_attempts = 0,
      locked_until = NULL
    WHERE id = ${client.id}
  `;

  await createSession(client.id, client.token);
  return NextResponse.json({ ok: true });
}
