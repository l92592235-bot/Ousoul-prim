import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthedClient } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const client = await getAuthedClient(params.token);
  if (!client) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const rows = await sql`
    SELECT p.*, (SELECT COUNT(*) FROM contracts c WHERE c.property_id = p.id)::int AS contract_count
    FROM properties p WHERE p.client_id = ${client.id} ORDER BY p.created_at DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const client = await getAuthedClient(params.token);
  if (!client) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const b = await req.json().catch(() => null);
  const name = (b?.name || '').toString().trim();
  if (!name) return NextResponse.json({ error: 'name_required' }, { status: 400 });

  const rows = await sql`
    INSERT INTO properties (client_id, name, address, property_type, estimated_value, owner_name, notes)
    VALUES (${client.id}, ${name}, ${b?.address || null}, ${b?.propertyType || 'residential'}, ${b?.estimatedValue ?? null}, ${b?.ownerName || null}, ${b?.notes || null})
    RETURNING *
  `;
  await sql`INSERT INTO activity_log (client_id, action_type, entity_label) VALUES (${client.id}, 'created_property', ${name})`;
  return NextResponse.json(rows[0]);
}
