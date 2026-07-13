import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(_req: NextRequest, { params }: { params: { token: string } }) {
  await destroySession(params.token);
  return NextResponse.json({ ok: true });
}
