import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthedClient } from '@/lib/auth';

const ALLOWED_CURRENCIES = ['SAR', 'AED', 'USD', 'EUR', 'GBP', 'KWD', 'QAR', 'BHD', 'OMR', 'EGP', 'JOD', 'CHF'];

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const client = await getAuthedClient(params.token);
  if (!client) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const currency = body?.currency ? String(body.currency).toUpperCase() : undefined;
  const lang = body?.lang ? String(body.lang) : undefined;

  if (currency && !ALLOWED_CURRENCIES.includes(currency)) {
    return NextResponse.json({ error: 'invalid_currency' }, { status: 400 });
  }
  if (lang && !['ar', 'en'].includes(lang)) {
    return NextResponse.json({ error: 'invalid_lang' }, { status: 400 });
  }

  if (currency) await sql`UPDATE clients SET currency = ${currency} WHERE id = ${client.id}`;
  if (lang) await sql`UPDATE clients SET lang = ${lang} WHERE id = ${client.id}`;

  return NextResponse.json({ ok: true });
}
