import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { answers, tech } = await req.json();
  // Llama a tu backend NestJS
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  const response = await fetch(`${apiUrl}/ai/evaluate-level`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, tech }),
  });
  const data = await response.json();
  return NextResponse.json(data);
}
