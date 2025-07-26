import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db.js';
import File from '../../../lib/models/File.js';
import { authenticateToken } from '../../../lib/auth.js';
import { generatePresignedUrl } from '../../../lib/b2.js';

export async function GET(request) {
  try {
    // Authenticate user
    const authResult = await authenticateToken(request);
    if (authResult) {
      return authResult;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'root';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const fileType = searchParams.get('type');

    const query = { userId: request.user._id, folder };

    if (fileType) {
      query.mimetype = { $regex: fileType, $options: 'i' };
    }

    const files = await File.find(query)
      .sort({ uploadedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await File.countDocuments(query);

    // Generate presigned URLs for each file
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const presignedUrl = await generatePresignedUrl(file.key);
        return {
          id: file._id,
          filename: file.filename,
          originalName: file.originalName,
          size: file.size,
          mimetype: file.mimetype,
          url: file.url,
          presignedUrl,
          folder: file.folder,
          uploadedAt: file.uploadedAt
        };
      })
    );

    return NextResponse.json({
      files: filesWithUrls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('File listing error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
} 