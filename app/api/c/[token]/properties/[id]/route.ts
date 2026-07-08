import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthedClient } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { token: string; id: string } }) {
  const client = await getAuthedClient(params.token);
  if (!client) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const id = Number(params.id);
  const b = await req.json().catch(() => null);
  const name = (b?.name || '').toString().trim();
  if (!name) return NextResponse.json({ error: 'name_required' }, { status: 400 });

  const rows = await sql`
    UPDATE properties SET
      name = ${name},
      address = ${b?.address || null},
      property_type = ${b?.propertyType || 'residential'},
      estimated_value = ${b?.estimatedValue ?? null},
      owner_name = ${b?.ownerName || null},
      notes = ${b?.notes || null},
      updated_at = now()
    WHERE id = ${id} AND client_id = ${client.id}
    RETURNING *
  `;
  if (!rows[0]) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  await sql`INSERT INTO activity_log (client_id, action_type, entity_label) VALUES (${client.id}, 'updated_property', ${name})`;
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { token: string; id: string } }) {
  const client = await getAuthedClient(params.token);
  if (!client) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const id = Number(params.id);
  const rows = await sql`DELETE FROM properties WHERE id = ${id} AND client_id = ${client.id} RETURNING name`;
  if (!rows[0]) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  await sql`INSERT INTO activity_log (client_id, action_type, entity_label) VALUES (${client.id}, 'deleted_property', ${rows[0].name})`;
  return NextResponse.json({ ok: true });
}
