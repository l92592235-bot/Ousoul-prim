import { cookies } from 'next/headers';
import { sql } from './db';
import { randomToken } from './crypto';

const SESSION_HOURS = 24;

export function cookieNameFor(token: string): string {
  return `osoul_sess_${token}`;
}

export async function createSession(clientId: number, clientToken: string): Promise<void> {
  const sessionToken = randomToken(32);
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
  await sql`
    INSERT INTO sessions (client_id, session_token, expires_at)
    VALUES (${clientId}, ${sessionToken}, ${expiresAt.toISOString()})
  `;
  const cookieStore = cookies();
  cookieStore.set(cookieNameFor(clientToken), sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function destroySession(clientToken: string): Promise<void> {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(cookieNameFor(clientToken))?.value;
  if (sessionToken) {
    await sql`DELETE FROM sessions WHERE session_token = ${sessionToken}`;
  }
  cookieStore.delete(cookieNameFor(clientToken));
}

export interface ClientRow {
  id: number;
  token: string;
  full_name: string | null;
  email: string | null;
  whatsapp: string | null;
  password_hash: string | null;
  currency: string;
  lang: string;
  setup_complete: boolean;
  failed_login_attempts: number;
  locked_until: string | null;
  created_at: string;
}

export async function getClientByToken(token: string): Promise<ClientRow | null> {
  const rows = await sql`SELECT * FROM clients WHERE token = ${token} LIMIT 1`;
  return (rows[0] as ClientRow) ?? null;
}

export async function getAuthedClient(token: string): Promise<ClientRow | null> {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(cookieNameFor(token))?.value;
  if (!sessionToken) return null;

  const rows = await sql`
    SELECT c.* FROM sessions s
    JOIN clients c ON c.id = s.client_id
    WHERE s.session_token = ${sessionToken}
      AND s.expires_at > now()
      AND c.token = ${token}
    LIMIT 1
  `;
  return (rows[0] as ClientRow) ?? null;
}
