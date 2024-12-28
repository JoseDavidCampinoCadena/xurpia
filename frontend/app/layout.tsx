'use client';

import './globals.css';
import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from './contexts/ThemeContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Rutas en las que no se debe mostrar el Navbar
  const hideNavbarRoutes = ['/register', '/login', '/home', '/admin', '/notes'];
  
  // Verificar si la ruta actual comienza con alguna de las rutas restringidas
  const shouldHideNavbar = hideNavbarRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Solo aplicar el fondo gradiente en la página principal
  const isMainPage = pathname === '/';
  const backgroundClass = isMainPage ? 'bg-gradient-to-br from-[#0a192f] via-[#0a192f] to-emerald-600' : 'bg-white dark:bg-zinc-900';

  return (
    <html lang="en" className={backgroundClass}>
      <head>
        <title>Xurp Ia</title>
      </head>
      <body>
        <ThemeProvider>
          {!shouldHideNavbar && <Navbar />}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}