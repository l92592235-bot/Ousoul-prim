import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const token = params.token;
  const manifest = {
    name: 'أصول برايم | Osoul Prime',
    short_name: 'Osoul Prime',
    description: 'منصة خاصة لإدارة الأملاك والعقود لكبار ملاك العقارات',
    start_url: `/c/${token}`,
    scope: `/c/${token}`,
    display: 'standalone',
    background_color: '#0b0d12',
    theme_color: '#0b0d12',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
}
