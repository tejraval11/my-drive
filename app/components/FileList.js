'use client';

import { useState } from 'react';

export default function FileList({ files, loading, onDelete, accessToken, onTokenRefresh }) {
  const [deletingFile, setDeletingFile] = useState(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) {
      return '🖼️';
    } else if (mimetype === 'application/pdf') {
      return '📄';
    } else if (mimetype.startsWith('text/')) {
      return '📝';
    } else if (mimetype.startsWith('video/')) {
      return '🎥';
    } else if (mimetype.startsWith('audio/')) {
      return '🎵';
    } else {
      return '📁';
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await fetch(`/api/files/download/${file.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.status === 401) {
        const newToken = await onTokenRefresh();
        if (newToken) {
          return handleDownload(file);
        }
        return;
      }

      if (response.ok) {
        const data = await response.json();
        // Open the presigned URL in a new tab
        window.open(data.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    setDeletingFile(fileId);
    try {
      await onDelete(fileId);
    } finally {
      setDeletingFile(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No files found. Upload some files to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">{getFileIcon(file.mimetype)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate" title={file.originalName}>
                      {file.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mb-3">
                  {formatDate(file.uploadedAt)}
                </p>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(file)}
                    className="flex-1 bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    disabled={deletingFile === file.id}
                    className="flex-1 bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deletingFile === file.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 