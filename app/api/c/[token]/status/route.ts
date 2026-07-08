import { NextRequest, NextResponse } from 'next/server';
import { getClientByToken, getAuthedClient } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const client = await getClientByToken(params.token);
  if (!client) {
    return NextResponse.json({ exists: false }, { status: 404 });
  }
  const authed = await getAuthedClient(params.token);
  return NextResponse.json({
    exists: true,
    setupComplete: client.setup_complete,
    authed: !!authed,
    locked: client.locked_until ? new Date(client.locked_until) > new Date() : false,
  });
}
