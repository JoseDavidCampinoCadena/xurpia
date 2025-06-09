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
        <title>Xurp IA</title>
        <meta name="description" content="Plataforma avanzada de gestión de proyectos potenciada por inteligencia artificial" />
        <meta name="color-scheme" content="dark" />
        {/* Favicons - forzar recarga */}
        <link rel="icon" href="/favicon.svg?v=3" type="image/svg+xml" />
        <link rel="icon" href="/favicon-16.svg?v=3" type="image/svg+xml" sizes="16x16" />
        <link rel="icon" href="/favicon-64.svg?v=3" type="image/svg+xml" sizes="64x64" />
        <link rel="shortcut icon" href="/favicon.svg?v=3" type="image/svg+xml" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg?v=3" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.svg?v=3" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Meta tags adicionales */}
        <meta name="theme-color" content="#39ff14" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <MainContent>{children}</MainContent>
        </ThemeProvider>
      </body>
    </html>
  );
}