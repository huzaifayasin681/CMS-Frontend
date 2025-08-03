'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Search,
  Grid,
  List,
  Filter,
  Download,
  Trash2,
  Eye,
  Copy,
  MoreVertical,
  Image,
  Video,
  FileText,
  Folder,
  Calendar,
  HardDrive,
  CheckSquare,
  Square,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoadingSkeleton } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/Toast';
import { usePermissions } from '@/lib/auth';
import { mediaAPI } from '@/lib/api';

interface MediaFile {
  _id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  createdAt: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  folder: string;
  cloudinaryId?: string;
  tags: string[];
  isUsed: boolean;
  usageCount: number;
}

// Add a type alias for easier usage
type MediaFileId = string;

// Mock data removed - now using real API

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'images' | 'videos' | 'documents';

export default function MediaLibraryPage() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const permissions = usePermissions();

  // Transform API response to match frontend interface
  const transformMediaFile = (apiFile: any): MediaFile => {
    return {
      _id: apiFile._id || apiFile.id,
      fileName: apiFile.fileName,
      originalName: apiFile.originalName,
      mimeType: apiFile.mimeType,
      size: apiFile.size,
      url: apiFile.url,
      alt: apiFile.alt,
      caption: apiFile.caption,
      width: apiFile.width,
      height: apiFile.height,
      createdAt: apiFile.createdAt || apiFile.uploadedAt,
      uploadedBy: typeof apiFile.uploadedBy === 'string' 
        ? { _id: '', name: apiFile.uploadedBy, email: '' }
        : apiFile.uploadedBy,
      folder: apiFile.folder,
      cloudinaryId: apiFile.cloudinaryId,
      tags: apiFile.tags || [],
      isUsed: apiFile.isUsed || false,
      usageCount: apiFile.usageCount || 0
    };
  };

  // Refresh media files function
  const refreshMediaFiles = async () => {
    try {
      setIsLoading(true);
      const response = await mediaAPI.getMedia();
      const rawFiles = response.data.media || response.data.files || response.data || [];
      const transformedFiles = rawFiles.map(transformMediaFile);
      setMediaFiles(transformedFiles);
      setFilteredFiles(transformedFiles);
    } catch (error) {
      console.error('Failed to refresh media files:', error);
      showToast.error('Failed to refresh media files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setIsLoading(true);
        const response = await mediaAPI.getMedia();
        const rawFiles = response.data.media || response.data.files || response.data || [];
        const transformedFiles = rawFiles.map(transformMediaFile);
        setMediaFiles(transformedFiles);
        setFilteredFiles(transformedFiles);
      } catch (error) {
        console.error('Failed to fetch media files:', error);
        showToast.error('Failed to load media files');
        // Fallback to empty array on error
        setMediaFiles([]);
        setFilteredFiles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, []);

  useEffect(() => {
    let filtered = mediaFiles.filter(file => {
      const matchesSearch = file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          file.originalName.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesFilter = true;
      if (filterType === 'images') {
        matchesFilter = file.mimeType.startsWith('image/');
      } else if (filterType === 'videos') {
        matchesFilter = file.mimeType.startsWith('video/');
      } else if (filterType === 'documents') {
        matchesFilter = !file.mimeType.startsWith('image/') && !file.mimeType.startsWith('video/');
      }
      
      return matchesSearch && matchesFilter;
    });

    setFilteredFiles(filtered);
  }, [mediaFiles, searchTerm, filterType]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const response = await mediaAPI.uploadMedia(file, {
          folder: 'uploads'
        });
        return response.data.media || response.data;
      });

      const rawUploadedFiles = await Promise.all(uploadPromises);
      const uploadedFiles = rawUploadedFiles.map(transformMediaFile);
      
      // Add uploaded files to the beginning of the list
      setMediaFiles(prev => [...uploadedFiles, ...prev]);
      showToast.success(`${files.length} file(s) uploaded successfully`);
      
      // Clear the input value so the same file can be uploaded again
      event.target.value = '';
    } catch (error: any) {
      console.error('Upload failed:', error);
      const errorMessage = error.response?.data?.message || 'Upload failed. Please try again.';
      showToast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      setIsDeleting(true);
      await mediaAPI.deleteMedia(fileId);
      setMediaFiles(prev => prev.filter(file => file._id !== fileId));
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
      showToast.success('File deleted successfully');
    } catch (error: any) {
      console.error('Delete failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete file';
      showToast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedFiles.length} selected files?`)) return;

    try {
      setIsDeleting(true);
      await mediaAPI.bulkDeleteMedia(selectedFiles);
      setMediaFiles(prev => prev.filter(file => !selectedFiles.includes(file._id)));
      const deletedCount = selectedFiles.length;
      setSelectedFiles([]);
      showToast.success(`${deletedCount} files deleted successfully`);
    } catch (error: any) {
      console.error('Bulk delete failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete files';
      showToast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(file => file._id));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast.success('URL copied to clipboard');
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    return FileText;
  };

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'text-green-500';
    if (mimeType.startsWith('video/')) return 'text-blue-500';
    return 'text-orange-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Media Library</h1>
          <p className="text-[var(--secondary)] mt-1">
            Manage your images, videos, and documents
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={refreshMediaFiles}
            disabled={isLoading}
            className={isLoading ? 'animate-spin' : ''}
          >
            Refresh
          </Button>
          
          {permissions.canManageMedia && (
            <>
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <label htmlFor="file-upload">
                <span className={`inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Upload className="w-4 h-4" />
                  {isUploading ? 'Uploading...' : 'Upload Files'}
                </span>
              </label>
            </>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Files', value: mediaFiles.length, icon: HardDrive },
          { label: 'Images', value: mediaFiles.filter(f => f.mimeType.startsWith('image/')).length, icon: Image },
          { label: 'Videos', value: mediaFiles.filter(f => f.mimeType.startsWith('video/')).length, icon: Video },
          { label: 'Documents', value: mediaFiles.filter(f => !f.mimeType.startsWith('image/') && !f.mimeType.startsWith('video/')).length, icon: FileText }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} padding="md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                  <Icon className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--secondary)]">{stat.label}</p>
                  <p className="text-lg font-semibold text-[var(--foreground)]">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card padding="lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                icon={Search}
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                <option value="all">All Files</option>
                <option value="images">Images</option>
                <option value="videos">Videos</option>
                <option value="documents">Documents</option>
              </select>

              <div className="flex border border-[var(--border)] rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  icon={Grid}
                  onClick={() => setViewMode('grid')}
                  className="rounded-none border-0"
                />
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  icon={List}
                  onClick={() => setViewMode('list')}
                  className="rounded-none border-0 border-l"
                />
              </div>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={selectedFiles.length === filteredFiles.length ? CheckSquare : Square}
                  onClick={handleSelectAll}
                >
                  {selectedFiles.length === filteredFiles.length ? 'Deselect All' : 'Select All'}
                </Button>
                <span className="text-sm text-[var(--secondary)]">
                  {selectedFiles.length} selected
                </span>
              </div>
              
              {permissions.canManageMedia && (
                <Button
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Selected'}
                </Button>
              )}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Media Grid/List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {isLoading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-4'}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} padding="md">
                <LoadingSkeleton lines={viewMode === 'grid' ? 3 : 2} />
              </Card>
            ))}
          </div>
        ) : filteredFiles.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFiles.map((file, index) => {
                const FileIcon = getFileIcon(file.mimeType);
                const isSelected = selectedFiles.includes(file._id);
                
                return (
                  <motion.div
                    key={file._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card hover padding="none" className={`relative cursor-pointer ${isSelected ? 'ring-2 ring-[var(--primary)]' : ''}`}>
                      <div className="aspect-square relative">
                        {file.mimeType.startsWith('image/') && file.url ? (
                          <img
                            src={file.url}
                            alt={file.alt || file.fileName}
                            className="w-full h-full object-cover rounded-t-xl"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center bg-[var(--surface)] rounded-t-xl ${getFileTypeColor(file.mimeType)}`}>
                            <FileIcon size={48} />
                          </div>
                        )}
                        
                        <div className="absolute top-2 left-2">
                          <button
                            onClick={() => handleSelectFile(file._id)}
                            className={`w-6 h-6 rounded-full border-2 ${
                              isSelected 
                                ? 'bg-[var(--primary)] border-[var(--primary)]' 
                                : 'bg-white/80 border-white/80'
                            } flex items-center justify-center`}
                          >
                            {isSelected && <CheckSquare size={14} className="text-white" />}
                          </button>
                        </div>
                        
                        <div className="absolute top-2 right-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={MoreVertical}
                            className="w-8 h-8 bg-white/80 hover:bg-white"
                          />
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <h4 className="font-medium text-[var(--foreground)] truncate mb-1">
                          {file.originalName}
                        </h4>
                        <div className="flex items-center justify-between text-sm text-[var(--secondary)]">
                          <span>{formatFileSize(file.size)}</span>
                          {file.width && file.height && (
                            <span>{file.width}×{file.height}</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--surface)] border-b border-[var(--border)]">
                    <tr>
                      <th className="text-left p-4">
                        <button onClick={handleSelectAll}>
                          {selectedFiles.length === filteredFiles.length ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                      </th>
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Type</th>
                      <th className="text-left p-4">Size</th>
                      <th className="text-left p-4">Uploaded</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.map((file, index) => {
                      const FileIcon = getFileIcon(file.mimeType);
                      const isSelected = selectedFiles.includes(file._id);
                      
                      return (
                        <motion.tr
                          key={file._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`border-b border-[var(--border)] hover:bg-[var(--surface)] ${isSelected ? 'bg-[var(--primary)]/5' : ''}`}
                        >
                          <td className="p-4">
                            <button onClick={() => handleSelectFile(file._id)}>
                              {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                            </button>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {file.mimeType.startsWith('image/') && file.url ? (
                                <img
                                  src={file.url}
                                  alt={file.alt || file.fileName}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              ) : (
                                <div className={`w-10 h-10 flex items-center justify-center bg-[var(--surface)] rounded ${getFileTypeColor(file.mimeType)}`}>
                                  <FileIcon size={20} />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-[var(--foreground)]">{file.originalName}</p>
                                <p className="text-sm text-[var(--secondary)]">{file.fileName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-[var(--secondary)]">{file.mimeType}</td>
                          <td className="p-4 text-[var(--secondary)]">{formatFileSize(file.size)}</td>
                          <td className="p-4 text-[var(--secondary)]">
                            <div>
                              <p>{new Date(file.createdAt).toLocaleDateString()}</p>
                              <p className="text-sm">{file.uploadedBy?.name || 'Unknown User'}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              {file.url && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={Eye}
                                    onClick={() => window.open(file.url, '_blank')}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={Copy}
                                    onClick={() => copyToClipboard(file.url)}
                                  />
                                </>
                              )}
                              {permissions.canManageMedia && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={Trash2}
                                  onClick={() => handleDeleteFile(file._id)}
                                  disabled={isDeleting}
                                />
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )
        ) : (
          <Card padding="xl">
            <div className="text-center py-12">
              <Upload className="w-16 h-16 text-[var(--secondary)] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
                No media files found
              </h3>
              <p className="text-[var(--secondary)] mb-6">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Upload your first media file to get started.'
                }
              </p>
              {permissions.canManageMedia && !searchTerm && filterType === 'all' && (
                <label htmlFor="file-upload">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Upload Files
                  </span>
                </label>
              )}
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
}