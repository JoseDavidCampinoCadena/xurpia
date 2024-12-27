'use client'
import React from 'react';
import '../globals.css';
import Sidebar from '../../components/Sidebar';

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <head>
        <title>Xurp Ia</title>
      </head>
      <body className="flex">
        <Sidebar />
        <div className="flex">
          {children}
        </div>
      </body>
    </html>
  );
};

export default HomeLayout;