import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthedClient } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MAX_SIZE = 15 * 1024 * 1024; // 15MB

export async function GET(_req: NextRequest, { params }: { params: { token: string; contractId: string } }) {
  const client = await getAuthedClient(params.token);
  if (!client) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const contractId = Number(params.contractId);
  const rows = await sql`
    SELECT id, file_name, mime_type, file_size, uploaded_at FROM contract_documents
    WHERE contract_id = ${contractId} AND client_id = ${client.id} ORDER BY uploaded_at DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest, { params }: { params: { token: string; contractId: string } }) {
  const client = await getAuthedClient(params.token);
  if (!client) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const contractId = Number(params.contractId);

  const owns = await sql`SELECT id FROM contracts WHERE id = ${contractId} AND client_id = ${client.id} LIMIT 1`;
  if (!owns[0]) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const b = await req.json().catch(() => null);
  const fileName = (b?.fileName || 'file').toString();
  const mimeType = (b?.mimeType || 'application/octet-stream').toString();
  const base64 = (b?.dataBase64 || '').toString();
  if (!base64) return NextResponse.json({ error: 'missing_data' }, { status: 400 });

  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length > MAX_SIZE) return NextResponse.json({ error: 'too_large' }, { status: 413 });

  const rows = await sql`
    INSERT INTO contract_documents (client_id, contract_id, file_name, mime_type, file_data, file_size)
    VALUES (${client.id}, ${contractId}, ${fileName}, ${mimeType}, ${buffer}, ${buffer.length})
    RETURNING id, file_name, mime_type, file_size, uploaded_at
  `;
  await sql`INSERT INTO activity_log (client_id, action_type, entity_label) VALUES (${client.id}, 'uploaded_document', ${fileName})`;
  return NextResponse.json(rows[0]);
}
