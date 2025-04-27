import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const redirectUrl = `${request.nextUrl.origin}/reset-password?token=${token}`;
  
  return NextResponse.redirect(redirectUrl);
} 