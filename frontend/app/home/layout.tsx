'use client'
import React from 'react';
import '../globals.css';
import Sidebar from '../../components/Sidebar';
import Notifications from './components/Notifications';
import ThemeToggle from '@/components/ThemeToggle';
import LogoutButton from "../components/LogoutButton";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-zinc-900">
      <Sidebar />
      <main className="flex-1">
        <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
          <Notifications />
          <ThemeToggle />
          <LogoutButton />
        </div>
        {children}
      </main>
    </div>
  );
}