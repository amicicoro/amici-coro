import { AdminPage } from '@/components/pages/admin-page';

export const dynamic = 'force-dynamic';

interface AdminIndexProps {
  searchParams: { tab?: string };
}

export default function AdminDashboardPage({ searchParams }: AdminIndexProps) {
  return <AdminPage activeTab={searchParams.tab || 'events'} />;
}
