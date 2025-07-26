import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/db.js';
import File from '../../../../../lib/models/File.js';
import { authenticateToken } from '../../../../../lib/auth.js';
import { generatePresignedUrl } from '../../../../../lib/b2.js';

export async function GET(request, { params }) {
  try {
    // Authenticate user
    const authResult = await authenticateToken(request);
    if (authResult) {
      return authResult;
    }

    await connectDB();

    const { id } = params;

    // Find file and verify ownership
    const file = await File.findOne({ _id: id, userId: request.user._id });
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Generate presigned URL for download
    const presignedUrl = await generatePresignedUrl(file.key, 3600); // 1 hour expiry

    return NextResponse.json({
      downloadUrl: presignedUrl,
      filename: file.originalName
    });

  } catch (error) {
    console.error('File download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate download link' },
      { status: 500 }
    );
  }
} 