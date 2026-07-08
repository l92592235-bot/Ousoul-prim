import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getClientByToken, createSession } from '@/lib/auth';
import { verifyPassword } from '@/lib/crypto';

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const client = await getClientByToken(params.token);
  if (!client || !client.setup_complete || !client.password_hash) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  if (client.locked_until && new Date(client.locked_until) > new Date()) {
    const minutesLeft = Math.ceil((new Date(client.locked_until).getTime() - Date.now()) / 60000);
    return NextResponse.json({ error: 'locked', minutesLeft }, { status: 423 });
  }

  const body = await req.json().catch(() => null);
  const password = (body?.password || '').toString();
  if (!password) return NextResponse.json({ error: 'password_required' }, { status: 400 });

  const ok = verifyPassword(password, client.password_hash);
  if (!ok) {
    const attempts = client.failed_login_attempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
      await sql`UPDATE clients SET failed_login_attempts = ${attempts}, locked_until = ${lockedUntil.toISOString()} WHERE id = ${client.id}`;
      return NextResponse.json({ error: 'locked', minutesLeft: LOCK_MINUTES }, { status: 423 });
    }
    await sql`UPDATE clients SET failed_login_attempts = ${attempts} WHERE id = ${client.id}`;
    return NextResponse.json({ error: 'wrong_password', attemptsLeft: MAX_ATTEMPTS - attempts }, { status: 401 });
  }

  await sql`UPDATE clients SET failed_login_attempts = 0, locked_until = NULL WHERE id = ${client.id}`;
  await createSession(client.id, client.token);
  return NextResponse.json({ ok: true });
}
