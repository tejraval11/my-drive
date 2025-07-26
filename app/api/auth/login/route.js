import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db.js';
import User from '../../../../lib/models/User.js';
import { generateTokens } from '../../../../lib/jwt.js';

export async function POST(request) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
} 