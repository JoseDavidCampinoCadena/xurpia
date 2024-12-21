'use client';
import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Rutas en las que no se debe mostrar el Navbar
  const hideNavbarRoutes = ['/register', '/login', '/home'];
  const showNavbar = !hideNavbarRoutes.includes(pathname);

  // Clase de fondo condicional
  const backgroundClass = pathname === '/home' ? 'bg-[#252527]' : 'bg-gradient-to-br from-[#0a192f] via-[#0a192f] to-emerald-600';

  return (
    <html lang="en" className={backgroundClass}>
      <head>
        <title>Xurp Ia</title>
      </head>
      <body className=' ' >
        {showNavbar && <Navbar />}
        {children}
      </body>
    </html>
  );
}