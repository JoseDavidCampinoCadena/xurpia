'use client';
import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Rutas que deberían mostrar el Navbar (enfoque inclusivo en lugar de exclusivo)
  const navbarRoutes = ['/', '/login', '/register'];
  const showNavbar = navbarRoutes.includes(pathname);

  // Clase de fondo condicional
  const backgroundClass = pathname.startsWith('/home') 
    ? 'bg-[#252527]' 
    : 'bg-gradient-to-br from-[#0a192f] via-[#0a192f] to-emerald-600';

  return (
    <html lang="en" className={backgroundClass}>
      <head>
        <title>Xurp Ia</title>
      </head>
      <body>
        {showNavbar && <Navbar />}
        {children}
      </body>
    </html>
  );
}