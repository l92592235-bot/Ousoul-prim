import { NextRequest, NextResponse } from 'next/server';
import { getAuthedClient } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const client = await getAuthedClient(params.token);
  if (!client) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json({
    fullName: client.full_name,
    email: client.email,
    whatsapp: client.whatsapp,
    currency: client.currency,
    lang: client.lang,
  });
}
