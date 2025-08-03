'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Link, Grid, Search } from 'lucide-react';
import { Button } from './Button';
import { showToast } from './Toast';
import { mediaAPI } from '@/lib/api';
import { Input } from './Input';

interface MediaFile {
  _id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  createdAt: string;
}

interface ImageUploadProps {
  onImageSelect: (url: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onClose,
  isOpen
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'library' | 'upload' | 'url'>('library');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && uploadMethod === 'library') {
      fetchMediaFiles();
    }
  }, [isOpen, uploadMethod]);

  const fetchMediaFiles = async () => {
    setIsLoadingMedia(true);
    try {
      const response = await mediaAPI.getMedia();
      const fetchedFiles = response.data.media || response.data.files || response.data || [];
      // Filter only images
      const imageFiles = fetchedFiles.filter((file: MediaFile) => 
        file.mimeType.startsWith('image/')
      );
      setMediaFiles(imageFiles);
    } catch (error) {
      console.error('Failed to fetch media files:', error);
      showToast.error('Failed to load media library');
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const filteredMediaFiles = mediaFiles.filter(file =>
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) {
      showToast.error('Please enter a valid image URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
      onImageSelect(imageUrl);
      setImageUrl('');
      onClose();
    } catch {
      showToast.error('Please enter a valid URL');
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showToast.error('Image file too large. Please select a file under 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Upload to backend media API
      const response = await mediaAPI.uploadMedia(file, {
        folder: 'posts'
      });
      
      const uploadedFile = response.data.media || response.data;
      onImageSelect(uploadedFile.url);
      onClose();
      showToast.success('Image uploaded successfully');
      
      // Refresh media files if we're in library mode
      if (uploadMethod === 'library') {
        fetchMediaFiles();
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload image';
      showToast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--background)] rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--foreground)]">Add Image</h2>
            <Button variant="outline" onClick={onClose} icon={X} size="sm">
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Method Selection */}
          <div className="flex gap-2">
            <button
              onClick={() => setUploadMethod('library')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                uploadMethod === 'library'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--border)]'
              }`}
            >
              <Grid size={16} className="inline mr-2" />
              Library
            </button>
            <button
              onClick={() => setUploadMethod('upload')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                uploadMethod === 'upload'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--border)]'
              }`}
            >
              <Upload size={16} className="inline mr-2" />
              Upload
            </button>
            <button
              onClick={() => setUploadMethod('url')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                uploadMethod === 'url'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--border)]'
              }`}
            >
              <Link size={16} className="inline mr-2" />
              URL
            </button>
          </div>

          {uploadMethod === 'library' ? (
            <div className="space-y-4">
              {/* Search */}
              <Input
                icon={Search}
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              {/* Media Grid */}
              <div className="max-h-64 overflow-y-auto">
                {isLoadingMedia ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-[var(--secondary)]">Loading images...</div>
                  </div>
                ) : filteredMediaFiles.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {filteredMediaFiles.map((file) => (
                      <button
                        key={file._id}
                        onClick={() => {
                          onImageSelect(file.url);
                          onClose();
                        }}
                        className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-[var(--primary)] transition-colors group"
                      >
                        <img
                          src={file.url}
                          alt={file.alt || file.originalName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ImageIcon className="w-12 h-12 text-[var(--secondary)] mx-auto mb-2" />
                    <p className="text-[var(--secondary)]">
                      {searchTerm ? 'No images found' : 'No images in library'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : uploadMethod === 'url' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
              </div>
              <Button onClick={handleUrlSubmit} fullWidth>
                Add Image
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  isDragging
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                    : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon size={48} className="mx-auto text-[var(--secondary)] mb-4" />
                <p className="text-[var(--foreground)] font-medium mb-2">
                  Drop an image here or click to browse
                </p>
                <p className="text-sm text-[var(--secondary)]">
                  Supports JPG, PNG, GIF up to 5MB
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />

              {isUploading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)]"></div>
                  <span className="ml-2 text-[var(--secondary)]">Uploading...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};