'use client'
import React from 'react';
import '../globals.css';
import Sidebar from '../../components/Sidebar';
import Notifications from './components/Notifications';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-zinc-900 dark:text-white">
      <Sidebar />
      <main className="flex-1">
        <div className="absolute top-4 right-4 z-50">
          <Notifications />
        </div>
        {children}
      </main>
    </div>
  );
}