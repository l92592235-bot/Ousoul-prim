import { NextRequest } from 'next/server';

export function isAdminAuthorized(req: NextRequest, bodySecret?: string): boolean {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return false;
  const headerSecret = req.headers.get('x-admin-secret');
  const secret = bodySecret || headerSecret;
  return secret === expected;
}
