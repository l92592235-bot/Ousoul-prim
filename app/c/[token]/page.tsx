import { ClientApp } from '@/components/ClientApp';

export default function ClientPage({ params }: { params: { token: string } }) {
  return <ClientApp token={params.token} />;
}
