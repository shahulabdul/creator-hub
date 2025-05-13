import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import Dashboard from '@/components/dashboard/Dashboard';
import { Suspense } from 'react';

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  // If user is not logged in, redirect to sign in page
  if (!session) {
    redirect('/auth/signin');
  }
  
  // Use Suspense to handle the client-side rendering
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>}>
      <Dashboard />
    </Suspense>
  );
}
