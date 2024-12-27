'use client'
import React from 'react';
import '../globals.css';
import Sidebar from '../../components/Sidebar';

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default HomeLayout;