import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  
  // If user is not logged in, redirect to sign in page
  if (!session) {
    redirect('/auth/signin');
  }
  
  return (
    <div className="container mx-auto py-6 px-4">
      <AnalyticsDashboard />
    </div>
  );
}
