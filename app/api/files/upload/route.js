import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '../../../../lib/db.js';
import File from '../../../../lib/models/File.js';
import { s3Client } from '../../../../lib/b2.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { authenticateToken } from '../../../../lib/auth.js';

export async function POST(request) {
  try {
    // Set timeout for large file uploads
    const timeout = setTimeout(() => {
      throw new Error('Upload timeout');
    }, 300000); // 5 minutes timeout

    // Authenticate user
    const authResult = await authenticateToken(request);
    if (authResult) {
      return authResult;
    }

    await connectDB();

    const formData = await request.formData();
    const files = formData.getAll('files');
    const folder = formData.get('folder') || 'root';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedFiles = [];

    for (const file of files) {
      if (!file || file.size === 0) continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Check minimum file size for Backblaze B2 (1 byte minimum)
      if (buffer.length === 0) {
        console.log('Skipping empty file:', file.name);
        continue;
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const uniqueId = uuidv4();
      const filename = `${uniqueId}.${fileExtension}`;
      const key = `${request.user._id}/${folder}/${filename}`;

            try {
        // Upload to Backblaze B2
        const uploadCommand = new PutObjectCommand({
          Bucket: process.env.B2_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        });

        await s3Client.send(uploadCommand);

        // Save file metadata to MongoDB
        const fileDoc = new File({
          filename: filename,
          originalName: file.name,
          size: file.size,
          mimetype: file.type,
          url: `${process.env.B2_ENDPOINT}/${process.env.B2_BUCKET_NAME}/${key}`,
          key: key,
          userId: request.user._id,
          folder: folder
        });

        await fileDoc.save();

        uploadedFiles.push({
          id: fileDoc._id,
          filename: fileDoc.filename,
          originalName: fileDoc.originalName,
          size: fileDoc.size,
          mimetype: fileDoc.mimetype,
          url: fileDoc.url,
          folder: fileDoc.folder,
          uploadedAt: fileDoc.uploadedAt
        });
      } catch (uploadError) {
        console.error('Upload error for file:', file.name, uploadError);
        continue; // Skip this file and continue with others
      }
    }

    clearTimeout(timeout);
    
    return NextResponse.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'File upload failed. Try uploading smaller files or check your connection.' },
      { status: 500 }
    );
  }
} 