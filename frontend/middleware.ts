import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Obtener el token del localStorage
  const token = request.cookies.get('token')?.value;
  const isAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register';

  // Si el usuario intenta acceder a login/register estando autenticado
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Si el usuario intenta acceder a rutas protegidas sin estar autenticado
  if (!token && !isAuthPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/home/:path*',
    '/admin/:path*',
    '/login',
    '/register'
  ],
}; 