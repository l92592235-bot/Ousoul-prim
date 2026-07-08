import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { randomToken } from '@/lib/crypto';
import { isAdminAuthorized } from '@/lib/admin';

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const rows = await sql`
    SELECT id, token, full_name, email, whatsapp, setup_complete, created_at,
      (SELECT COUNT(*) FROM properties p WHERE p.client_id = clients.id)::int AS property_count,
      (SELECT COUNT(*) FROM contracts c WHERE c.client_id = clients.id)::int AS contract_count
    FROM clients ORDER BY created_at DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!isAdminAuthorized(req, body?.adminSecret)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const label = (body?.label || '').toString().trim() || null;
  const token = randomToken(16); // 32-char hex, unguessable
  await sql`INSERT INTO clients (token, full_name) VALUES (${token}, ${label})`;
  return NextResponse.json({ token });
}
