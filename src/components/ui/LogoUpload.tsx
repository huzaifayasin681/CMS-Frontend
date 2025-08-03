'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import { showToast } from './Toast';
import { settingsAPI } from '@/lib/api';

interface LogoUploadProps {
  currentLogo?: string;
  onLogoChange: (url: string) => void;
  disabled?: boolean;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({
  currentLogo,
  onLogoChange,
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB for logos)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Logo image must be under 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Upload logo using settings API
      const response = await settingsAPI.uploadLogo(file);
      
      const uploadedMedia = response.data.media;
      onLogoChange(uploadedMedia.url);
      showToast.success('Logo uploaded successfully');
      
    } catch (error: any) {
      console.error('Logo upload failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload logo';
      showToast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveLogo = () => {
    onLogoChange('');
    showToast.success('Logo removed');
  };

  return (
    <div className="space-y-4">
      {/* Logo Preview */}
      {currentLogo && (
        <div className="flex items-center gap-4 p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
          <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
            <img
              src={currentLogo}
              alt="Site Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--foreground)]">Current Logo</p>
            <p className="text-xs text-[var(--secondary)]">Click upload to change</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveLogo}
            disabled={disabled || isUploading}
            icon={X}
          >
            Remove
          </Button>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
          ${isDragging
            ? 'border-[var(--primary)] bg-[var(--primary)]/5'
            : 'border-[var(--border)] hover:border-[var(--primary)]/50'
          }
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mb-2"></div>
            <p className="text-sm text-[var(--secondary)]">Uploading logo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 text-[var(--secondary)] mb-2" />
            <p className="text-sm font-medium text-[var(--foreground)] mb-1">
              {currentLogo ? 'Replace Logo' : 'Upload Logo'}
            </p>
            <p className="text-xs text-[var(--secondary)] mb-2">
              Drop an image here or click to browse
            </p>
            <p className="text-xs text-[var(--secondary)]">
              Supports JPG, PNG, SVG up to 5MB
            </p>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Upload Hint Text for drag & drop */}
      {isDragging && !disabled && !isUploading && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-[var(--foreground)] text-[var(--background)] text-xs rounded whitespace-nowrap z-10">
          Drop image to upload
        </div>
      )}
    </div>
  );
};

export default LogoUpload;