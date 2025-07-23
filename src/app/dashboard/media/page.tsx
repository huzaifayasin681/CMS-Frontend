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
  Square
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoadingSkeleton } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/Toast';
import { usePermissions } from '@/lib/auth';
import { mediaAPI } from '@/lib/api';

interface MediaFile {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  uploadedAt: string;
  uploadedBy: string;
  folder: string;
}

const mockMediaFiles: MediaFile[] = [
  {
    id: '1',
    fileName: 'hero-banner.jpg',
    originalName: 'hero-banner.jpg',
    mimeType: 'image/jpeg',
    size: 1024000,
    url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800',
    alt: 'Hero banner image',
    width: 1920,
    height: 1080,
    uploadedAt: '2024-01-15T10:00:00Z',
    uploadedBy: 'John Doe',
    folder: 'images'
  },
  {
    id: '2',
    fileName: 'profile-photo.png',
    originalName: 'my-profile.png',
    mimeType: 'image/png',
    size: 512000,
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    alt: 'Profile photo',
    width: 800,
    height: 800,
    uploadedAt: '2024-01-14T15:30:00Z',
    uploadedBy: 'Jane Smith',
    folder: 'profiles'
  },
  {
    id: '3',
    fileName: 'tutorial-video.mp4',
    originalName: 'getting-started.mp4',
    mimeType: 'video/mp4',
    size: 10240000,
    url: '',
    uploadedAt: '2024-01-13T12:00:00Z',
    uploadedBy: 'Mike Johnson',
    folder: 'videos'
  },
  {
    id: '4',
    fileName: 'document.pdf',
    originalName: 'user-guide.pdf',
    mimeType: 'application/pdf',
    size: 256000,
    url: '',
    uploadedAt: '2024-01-12T09:15:00Z',
    uploadedBy: 'Sarah Wilson',
    folder: 'documents'
  }
];

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
  
  const permissions = usePermissions();

  useEffect(() => {
    const fetchMedia = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMediaFiles(mockMediaFiles);
      setFilteredFiles(mockMediaFiles);
      setIsLoading(false);
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
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newFiles: MediaFile[] = Array.from(files).map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        fileName: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Current User',
        folder: 'uploads'
      }));

      setMediaFiles(prev => [...newFiles, ...prev]);
      showToast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      showToast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setMediaFiles(prev => prev.filter(file => file.id !== fileId));
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
      showToast.success('File deleted successfully');
    } catch (error) {
      showToast.error('Failed to delete file');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedFiles.length} selected files?`)) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMediaFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
      setSelectedFiles([]);
      showToast.success(`${selectedFiles.length} files deleted successfully`);
    } catch (error) {
      showToast.error('Failed to delete files');
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
      setSelectedFiles(filteredFiles.map(file => file.id));
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

        {permissions.canManageMedia && (
          <div className="flex items-center gap-3">
            <input
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <span className={`inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload className="w-4 h-4" />
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </span>
            </label>
          </div>
        )}
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
                >
                  Delete Selected
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
                const isSelected = selectedFiles.includes(file.id);
                
                return (
                  <motion.div
                    key={file.id}
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
                            onClick={() => handleSelectFile(file.id)}
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
                      const isSelected = selectedFiles.includes(file.id);
                      
                      return (
                        <motion.tr
                          key={file.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`border-b border-[var(--border)] hover:bg-[var(--surface)] ${isSelected ? 'bg-[var(--primary)]/5' : ''}`}
                        >
                          <td className="p-4">
                            <button onClick={() => handleSelectFile(file.id)}>
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
                              <p>{new Date(file.uploadedAt).toLocaleDateString()}</p>
                              <p className="text-sm">{file.uploadedBy}</p>
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
                                  onClick={() => handleDeleteFile(file.id)}
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