import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db.js';
import User from '../../../../lib/models/User.js';
import { generateTokens } from '../../../../lib/jwt.js';

export async function POST(request) {
  try {
    console.log('Registration endpoint called');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
    
    await connectDB();
    console.log('Database connected successfully');

    const { email, password, name } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = new User({
      email,
      password,
      name
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      },
      accessToken,
      refreshToken
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Registration failed', details: error.message },
      { status: 500 }
    );
  }
} 