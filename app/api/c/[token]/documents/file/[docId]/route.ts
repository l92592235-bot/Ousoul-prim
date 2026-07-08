import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthedClient } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: { token: string; docId: string } }) {
  const client = await getAuthedClient(params.token);
  if (!client) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const docId = Number(params.docId);
  const rows = await sql`
    SELECT file_name, mime_type, file_data FROM contract_documents WHERE id = ${docId} AND client_id = ${client.id} LIMIT 1
  `;
  const doc = rows[0] as { file_name: string; mime_type: string; file_data: Buffer } | undefined;
  if (!doc) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  return new NextResponse(doc.file_data as unknown as BodyInit, {
    headers: {
      'Content-Type': doc.mime_type,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(doc.file_name)}"`,
    },
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { token: string; docId: string } }) {
  const client = await getAuthedClient(params.token);
  if (!client) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const docId = Number(params.docId);
  const rows = await sql`DELETE FROM contract_documents WHERE id = ${docId} AND client_id = ${client.id} RETURNING file_name`;
  if (!rows[0]) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  await sql`INSERT INTO activity_log (client_id, action_type, entity_label) VALUES (${client.id}, 'deleted_document', ${rows[0].file_name})`;
  return NextResponse.json({ ok: true });
}
