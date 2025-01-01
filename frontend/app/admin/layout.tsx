'use client';

import '../globals.css';
import AdminSidebar from './components/AdminSidebar';
import AdminNotifications from './components/AdminNotifications';
import ThemeToggle from '@/components/ThemeToggle';
import { LogoutButton } from "../components/LogoutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
      <AdminSidebar />
      <main className="flex-1">
        <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
          <AdminNotifications />
          <ThemeToggle />
          <LogoutButton />
        </div>
        {children}
      </main>
    </div>
  );
} 