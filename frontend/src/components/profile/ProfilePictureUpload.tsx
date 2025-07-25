'use client';

import React, { useState, useRef } from 'react';
import { userApi } from '@/lib/api';

interface ProfilePictureUploadProps {
  currentPicture?: string;
  onUploadSuccess: (url: string) => void;
  onError: (error: string) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentPicture,
  onUploadSuccess,
  onError
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      onError('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      onError('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);

    try {
      const response = await userApi.uploadProfilePicture(file);
      
      if (response.success && response.data) {
        onUploadSuccess(response.data.profilePictureUrl);
        setPreviewUrl(null);
      } else {
        onError(response.error || 'Failed to upload profile picture');
        setPreviewUrl(null);
      }
    } catch (err) {
      onError('An unexpected error occurred during upload');
      setPreviewUrl(null);
      console.error('Profile picture upload error:', err);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!currentPicture) return;

    setIsUploading(true);

    try {
      const response = await userApi.deleteProfilePicture();
      
      if (response.success) {
        onUploadSuccess('');
      } else {
        onError(response.error || 'Failed to delete profile picture');
      }
    } catch (err) {
      onError('An unexpected error occurred');
      console.error('Profile picture delete error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const displayPicture = previewUrl || currentPicture;

  return (
    <div className="flex items-start space-x-6">
      {/* Profile Picture Display */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
          {displayPicture ? (
            <img
              src={displayPicture.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${displayPicture}` : displayPicture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex-1">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Picture</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload a profile picture to personalize your account. Supported formats: JPEG, PNG, WebP. Maximum size: 5MB.
        </p>

        <div className="flex flex-wrap gap-3">
          {/* Upload Button */}
          <button
            onClick={triggerFileSelect}
            disabled={isUploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {currentPicture ? 'Change Picture' : 'Upload Picture'}
          </button>

          {/* Delete Button */}
          {currentPicture && (
            <button
              onClick={handleDelete}
              disabled={isUploading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Remove Picture
            </button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Preview Info */}
        {previewUrl && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Preview:</span> Your new profile picture is being uploaded...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePictureUpload;