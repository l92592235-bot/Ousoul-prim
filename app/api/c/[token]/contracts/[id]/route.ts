import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthedClient } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(req: NextRequest, { params }: { params: { token: string; id: string } }) {
  const client = await getAuthedClient(params.token);
  if (!client) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const id = Number(params.id);
  const b = await req.json().catch(() => null);
  const title = (b?.title || '').toString().trim();
  const partyName = (b?.partyName || '').toString().trim();
  const deadline = (b?.deadline || '').toString();
  if (!title || !partyName || !deadline) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const rows = await sql`
    UPDATE contracts SET
      property_id = ${b?.propertyId ?? null},
      title = ${title},
      contract_type = ${b?.contractType || 'lease'},
      party_name = ${partyName},
      start_date = ${b?.startDate || null},
      deadline = ${deadline},
      alert_days = ${b?.alertDays ?? 30},
      notify_email = ${b?.notifyEmail || client.email},
      status = ${b?.status || 'active'},
      notes = ${b?.notes || null},
      updated_at = now()
    WHERE id = ${id} AND client_id = ${client.id}
    RETURNING *
  `;
  if (!rows[0]) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  await sql`INSERT INTO activity_log (client_id, action_type, entity_label) VALUES (${client.id}, 'updated_contract', ${title})`;
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { token: string; id: string } }) {
  const client = await getAuthedClient(params.token);
  if (!client) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const id = Number(params.id);
  const rows = await sql`DELETE FROM contracts WHERE id = ${id} AND client_id = ${client.id} RETURNING title`;
  if (!rows[0]) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  await sql`INSERT INTO activity_log (client_id, action_type, entity_label) VALUES (${client.id}, 'deleted_contract', ${rows[0].title})`;
  return NextResponse.json({ ok: true });
}
