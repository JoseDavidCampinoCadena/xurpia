'use client';

import './globals.css';
import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from './contexts/ThemeContext';

function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Rutas en las que no se debe mostrar el Navbar
  const hideNavbarRoutes = ['/home', '/admin', '/notes'];
  
  // Verificar si la ruta actual comienza con alguna de las rutas restringidas
  const shouldHideNavbar = hideNavbarRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Solo aplicar el fondo gradiente en la página principal
  const isMainPage = pathname === '/';
  const bgClass = isMainPage ? 'public-route' : 'bg-[rgb(var(--background))]';

  return (
    <div className={`min-h-screen ${bgClass}`}>
      {!shouldHideNavbar && <Navbar />}
      {children}
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Xurp Ia</title>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <MainContent>{children}</MainContent>
        </ThemeProvider>
      </body>
    </html>
  );
}