import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

function getAuthHeader(req: NextRequest) {
  // Intenta obtener el token de la cookie (NextAuth, custom, etc)
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/token=([^;]+)/);
  if (match) {
    return { Authorization: `Bearer ${match[1]}` };
  }
  // Si no hay cookie, intenta pasar el header original
  const auth = req.headers.get('authorization');
  if (auth) {
    return { Authorization: auth };
  }
  return {};
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const projectId = url.pathname.split('/').pop();
  try {
    const response = await axios.get(`${BACKEND_URL}/events/${projectId}`, {
      headers: {
        ...getAuthHeader(req),
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const projectId = url.pathname.split('/').pop();
  const body = await req.json();
  try {
    const response = await axios.post(`${BACKEND_URL}/events/${projectId}`, body, {
      headers: {
        ...getAuthHeader(req),
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
