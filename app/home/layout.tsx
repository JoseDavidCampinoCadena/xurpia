'use client'
import React from 'react';

import '../globals.css';
import { usePathname } from 'next/navigation';
import Sidebar from '../../components/Sidebar';

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Mostrar Sidebar solo si la ruta incluye '/home'
  const showSidebar = pathname.startsWith('/home');

  return (
    <html lang="en">
      <head>
        <title>Xurp Ia</title>
      </head>
      <body>
        {showSidebar && <Sidebar />}
        {children}
      </body>
    </html>
  );
};

export default HomeLayout;