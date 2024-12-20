'use client';
import Navbar from '@/components/Navbar';
//import { Albert_Sans } from 'next/font/google';
import { usePathname } from 'next/navigation'; // Import correcto

//const albertsans = Albert_Sans();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Rutas en las que no se debe mostrar el Navbar
  const hideNavbarRoutes = ['/register', '/login'];
  const showNavbar = !hideNavbarRoutes.includes(pathname);

  return (
    <html lang="en" className='bg-gradient-to-br from-[#0a192f] via-[#0a192f] to-emerald-600'>
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
