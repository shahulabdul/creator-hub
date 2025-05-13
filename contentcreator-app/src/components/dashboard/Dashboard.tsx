'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import ProjectsOverview from '../projects/ProjectsOverview';
import TasksOverview from '../tasks/TasksOverview';
import AssetsOverview from '../assets/AssetsOverview';
import CalendarOverview from '../calendar/CalendarOverview';

// Dashboard view options
type DashboardView = 'overview' | 'projects' | 'tasks' | 'assets' | 'calendar' | 'checklists';

export default function Dashboard() {
  const { data: session, status } = useSession({ required: true });
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  console.log('Dashboard component - session:', session);

  // Handle loading state
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Handle unauthenticated state (should be redirected by the parent component, but just in case)
  if (!session) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to access the dashboard</h1>
        <Link 
          href="/auth/signin"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Render the appropriate content based on the current view
  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProjectsOverview limit={3} />
            <TasksOverview limit={5} />
            <AssetsOverview limit={6} />
            <CalendarOverview />
          </div>
        );
      case 'projects':
        return <ProjectsOverview />;
      case 'tasks':
        return <TasksOverview />;
      case 'assets':
        return <AssetsOverview />;
      case 'calendar':
        return <CalendarOverview />;
      case 'checklists':
        return <div>Checklists content coming soon</div>;
      default:
        return <div>Select a view from the sidebar</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        currentView={currentView}
        onChangeView={setCurrentView}
        onToggle={toggleSidebar}
      />

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <DashboardHeader 
          user={session.user}
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
