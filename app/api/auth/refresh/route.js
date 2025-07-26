import { NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken } from '../../../../lib/jwt.js';

export async function POST(request) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 403 }
      );
    }

    const newAccessToken = generateAccessToken(decoded.userId);

    return NextResponse.json({
      accessToken: newAccessToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    );
  }
} 