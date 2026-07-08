import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthedClient } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const client = await getAuthedClient(params.token);
  if (!client) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const rows = await sql`
    SELECT c.*, p.name AS property_name
    FROM contracts c LEFT JOIN properties p ON p.id = c.property_id
    WHERE c.client_id = ${client.id}
    ORDER BY c.deadline ASC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const client = await getAuthedClient(params.token);
  if (!client) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const b = await req.json().catch(() => null);
  const title = (b?.title || '').toString().trim();
  const partyName = (b?.partyName || '').toString().trim();
  const deadline = (b?.deadline || '').toString();
  if (!title || !partyName || !deadline) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO contracts (client_id, property_id, title, contract_type, party_name, deadline, alert_days, notify_email, status, notes)
    VALUES (${client.id}, ${b?.propertyId ?? null}, ${title}, ${b?.contractType || 'lease'}, ${partyName}, ${deadline}, ${b?.alertDays ?? 30}, ${b?.notifyEmail || client.email}, ${b?.status || 'active'}, ${b?.notes || null})
    RETURNING *
  `;
  await sql`INSERT INTO activity_log (client_id, action_type, entity_label) VALUES (${client.id}, 'created_contract', ${title})`;
  return NextResponse.json(rows[0]);
}
