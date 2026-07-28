import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth.config';
import { getDashboardData } from '@/lib/dashboard-data';
import AtelierV21Lazy from './AtelierV21Lazy';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  const data = await getDashboardData();
  return <AtelierV21Lazy data={data} />;
}
