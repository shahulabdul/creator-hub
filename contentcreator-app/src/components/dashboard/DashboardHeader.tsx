'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Bell, Menu, Search, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export default function DashboardHeader({ user, onToggleSidebar, sidebarOpen }: DashboardHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    if (notificationsOpen) setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    if (userMenuOpen) setUserMenuOpen(false);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 z-10">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="p-2 mr-2 rounded-full hover:bg-gray-100 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* AI Studio Link */}
        <Link href="/ai-studio" legacyBehavior>
          <a className="text-sm font-medium text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md hover:bg-gray-100">
            AI Studio
          </a>
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="p-2 rounded-full hover:bg-gray-100 relative"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              3
            </span>
          </button>
          
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
              <div className="p-3 border-b">
                <h3 className="text-sm font-medium">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div className="p-3 border-b hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm font-medium">New task assigned to you</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
                <div className="p-3 border-b hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm font-medium">Project deadline approaching</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
                <div className="p-3 hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm font-medium">New comment on your asset</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
              <div className="p-2 border-t text-center">
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* User menu */}
        <div className="relative">
          <button
            onClick={toggleUserMenu}
            className="flex items-center space-x-2 focus:outline-none"
            aria-label="User menu"
          >
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || 'User'}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <User size={16} />
              </div>
            )}
            <span className="hidden md:block text-sm font-medium">{user.name || user.email}</span>
          </button>
          
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20">
              <div className="p-3 border-b">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
                  Profile Settings
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
                  Account Settings
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
