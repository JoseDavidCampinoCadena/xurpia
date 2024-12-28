import { usePathname } from 'next/navigation';

export function useRouteType() {
  const pathname = usePathname();
  
  const isPublicRoute = ['/', '/login', '/register'].includes(pathname);
  const isAdminRoute = pathname.startsWith('/admin');
  const isHomeRoute = pathname.startsWith('/home');

  return {
    isPublicRoute,
    isAdminRoute,
    isHomeRoute,
  };
} 