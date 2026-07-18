import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  return {
    manifest: `/c/${params.token}/manifest.webmanifest`,
  };
}

export default function ClientTokenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
