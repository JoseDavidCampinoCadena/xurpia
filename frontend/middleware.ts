import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Por ahora, simplemente verificamos si hay un token en las cookies
  const token = request.cookies.get('token');
  
  // Proteger rutas de administrador
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Proteger rutas de usuario autenticado
  if (request.nextUrl.pathname.startsWith('/home')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/home/:path*'],
}; 