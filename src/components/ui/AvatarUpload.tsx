'use client';

import React, { useRef, useState } from 'react';
import { Camera, Upload, X, User, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import { showToast } from './Toast';
import { authAPI } from '@/lib/api';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (url: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  username?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarChange,
  size = 'lg',
  editable = true,
  username = 'User'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB for avatars)
    if (file.size > 2 * 1024 * 1024) {
      showToast.error('Avatar image must be under 2MB');
      return;
    }

    setIsUploading(true);

    try {
      // Upload avatar using auth API
      const response = await authAPI.uploadAvatar(file);
      
      const uploadedMedia = response.data.media;
      onAvatarChange(uploadedMedia.url);
      showToast.success('Avatar updated successfully');
      
    } catch (error: any) {
      console.error('Avatar upload failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload avatar';
      showToast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!editable) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (editable) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (editable && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="relative inline-block">
      <div
        className={`
          relative ${sizeClasses[size]} rounded-full overflow-hidden 
          ${editable ? 'cursor-pointer group' : ''}
          ${isDragging ? 'ring-2 ring-[var(--primary)] ring-offset-2' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        {/* Avatar Image or Placeholder */}
        {currentAvatar ? (
          <img
            src={currentAvatar}
            alt={`${username} avatar`}
            className={`
              w-full h-full object-cover
              ${editable ? 'group-hover:opacity-75 transition-opacity' : ''}
            `}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
            <User 
              size={iconSizes[size]} 
              className="text-white" 
            />
          </div>
        )}

        {/* Upload Overlay */}
        {editable && (
          <div 
            className={`
              absolute inset-0 bg-black/50 flex items-center justify-center
              opacity-0 group-hover:opacity-100 transition-opacity
              ${isUploading ? 'opacity-100' : ''}
            `}
          >
            {isUploading ? (
              <div className="animate-spin rounded-full border-2 border-white border-t-transparent w-6 h-6" />
            ) : (
              <Camera size={iconSizes[size] * 0.6} className="text-white" />
            )}
          </div>
        )}

        {/* Drag Overlay */}
        {isDragging && editable && (
          <div className="absolute inset-0 bg-[var(--primary)]/80 flex items-center justify-center">
            <Upload size={iconSizes[size] * 0.6} className="text-white" />
          </div>
        )}
      </div>

      {/* Edit Button for larger sizes */}
      {editable && (size === 'lg' || size === 'xl') && (
        <Button
          variant="primary"
          size="sm"
          icon={Camera}
          onClick={handleClick}
          disabled={isUploading}
          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 shadow-lg"
          title="Change avatar"
        />
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Hint Text for drag & drop */}
      {editable && isDragging && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-[var(--foreground)] text-[var(--background)] text-xs rounded whitespace-nowrap z-10">
          Drop image to upload
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;