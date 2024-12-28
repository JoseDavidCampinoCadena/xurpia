'use client';

import '../globals.css';
import AdminSidebar from './components/AdminSidebar';
import AdminNotifications from './components/AdminNotifications';
import ThemeToggle from '@/components/ThemeToggle';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-zinc-900 dark:text-white">
      <AdminSidebar />
      <main className="flex-1">
        <div className="relative">
          <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
            <AdminNotifications />
            <ThemeToggle />
          </div>
        </div>
        {children}
      </main>
    </div>
  );
} 