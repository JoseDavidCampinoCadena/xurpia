'use client';
import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from './contexts/ThemeContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const publicRoutes = ['/', '/login', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  return (
    <html lang="en">
      <body className={isPublicRoute ? 'bg-gradient-to-br from-[#0a192f] via-[#0a192f] to-emerald-600' : ''}>
        <ThemeProvider>
          {isPublicRoute && <Navbar />}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}