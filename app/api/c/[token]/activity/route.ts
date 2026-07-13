import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthedClient } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const client = await getAuthedClient(params.token);
  if (!client) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const rows = await sql`
    SELECT * FROM activity_log WHERE client_id = ${client.id} ORDER BY created_at DESC LIMIT 20
  `;
  return NextResponse.json(rows);
}
