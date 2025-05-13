'use client';

import Link from 'next/link';
import { 
  Calendar, 
  CheckSquare, 
  FileText, 
  Grid, 
  Home, 
  Image as ImageIcon, 
  ChevronLeft, 
  ChevronRight,
  BarChart2
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  currentView: string;
  onChangeView: (view: any) => void;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, currentView, onChangeView, onToggle }: SidebarProps) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'projects', label: 'Projects', icon: Grid },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'assets', label: 'Assets', icon: ImageIcon },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'checklists', label: 'Checklists', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart2, path: '/analytics' },
  ];

  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-white shadow-md transition-all duration-300 z-10 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {isOpen && (
          <h1 className="text-lg font-bold text-blue-600">Content Creator</h1>
        )}
        <button 
          onClick={onToggle}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
      
      <nav className="mt-6">
        <ul>
          {navItems.map((item) => {
            const Icon = item.icon;
            
            // If the item has a path, render a Link instead of a button
            if (item.path) {
              return (
                <li key={item.id}>
                  <Link
                    href={item.path}
                    className={`flex items-center w-full px-4 py-3 hover:bg-gray-100 transition-colors ${
                      currentView === item.id ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                    }`}
                  >
                    <Icon size={20} />
                    {isOpen && <span className="ml-4">{item.label}</span>}
                  </Link>
                </li>
              );
            }
            
            // Otherwise render a button for dashboard views
            return (
              <li key={item.id}>
                <button
                  onClick={() => onChangeView(item.id)}
                  className={`flex items-center w-full px-4 py-3 hover:bg-gray-100 transition-colors ${
                    currentView === item.id ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                  }`}
                >
                  <Icon size={20} />
                  {isOpen && <span className="ml-4">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {isOpen && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="text-xs text-gray-500">
            <p>Content Creator Workflow</p>
            <p>v0.1.0</p>
          </div>
        </div>
      )}
    </aside>
  );
}
