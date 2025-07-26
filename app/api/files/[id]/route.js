import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db.js';
import File from '../../../../lib/models/File.js';
import { authenticateToken } from '../../../../lib/auth.js';
import { deleteFile } from '../../../../lib/b2.js';

export async function DELETE(request, { params }) {
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

    // Delete from Backblaze B2
    try {
      await deleteFile(file.key);
    } catch (error) {
      console.error('Error deleting from B2:', error);
      // Continue with database deletion even if B2 deletion fails
    }

    // Delete from database
    await File.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
} 