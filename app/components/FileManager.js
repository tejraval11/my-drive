'use client';

import { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import FileList from './FileList';

export default function FileManager({ accessToken, onTokenRefresh }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentFolder, setCurrentFolder] = useState('root');
  const [fileTypeFilter, setFileTypeFilter] = useState('');

  const fetchFiles = async (token = accessToken) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        folder: currentFolder,
        ...(fileTypeFilter && { type: fileTypeFilter })
      });

      const response = await fetch(`/api/files?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        const newToken = await onTokenRefresh();
        if (newToken) {
          return fetchFiles(newToken);
        }
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch files');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (uploadedFiles) => {
    await fetchFiles();
  };

  const handleFileDelete = async (fileId) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.status === 401) {
        const newToken = await onTokenRefresh();
        if (newToken) {
          return handleFileDelete(fileId);
        }
        return;
      }

      if (response.ok) {
        setFiles(files.filter(file => file.id !== fileId));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete file');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [currentFolder, fileTypeFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Files</h2>
              <p className="text-sm text-gray-500">
                {currentFolder === 'root' ? 'Root folder' : `Folder: ${currentFolder}`}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={fileTypeFilter}
                onChange={(e) => setFileTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All file types</option>
                <option value="image">Images</option>
                <option value="pdf">PDFs</option>
                <option value="text">Documents</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
              </select>
              
              <input
                type="text"
                placeholder="Folder name"
                value={currentFolder === 'root' ? '' : currentFolder}
                onChange={(e) => setCurrentFolder(e.target.value || 'root')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          <FileUpload 
            accessToken={accessToken} 
            onUpload={handleFileUpload}
            onTokenRefresh={onTokenRefresh}
            folder={currentFolder}
          />

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <FileList 
            files={files}
            loading={loading}
            onDelete={handleFileDelete}
            accessToken={accessToken}
            onTokenRefresh={onTokenRefresh}
          />
        </div>
      </div>
    </div>
  );
} 