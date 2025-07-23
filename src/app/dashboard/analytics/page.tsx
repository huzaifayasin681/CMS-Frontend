'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Activity,
  Clock,
  Globe,
  Download,
  Search,
  Heart,
  Image,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSkeleton } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/Toast';
import { analyticsAPI } from '@/lib/api';

// Backend data interfaces
interface DashboardOverview {
  overview: {
    totalPosts: number;
    totalPages: number;
    totalUsers: number;
    totalMedia: number;
    publishedPosts: number;
    draftPosts: number;
    totalViews: number;
    totalLikes: number;
    postsThisMonth: number;
    postsThisWeek: number;
  };
  growth: {
    posts: { value: number; trend: 'up' | 'down' | 'stable' };
    views: { value: number; trend: 'up' | 'down' | 'stable' };
    users: { value: number; trend: 'up' | 'down' | 'stable' };
    likes: { value: number; trend: 'up' | 'down' | 'stable' };
  };
}

interface ContentPerformance {
  topPostsByViews: Array<{
    _id: string;
    title: string;
    slug: string;
    views: number;
    likes: any[];
    publishedAt: string;
    author: {
      username: string;
      firstName?: string;
      lastName?: string;
    };
  }>;
  topPostsByLikes: Array<{
    _id: string;
    title: string;
    slug: string;
    views: number;
    likes: any[];
    publishedAt: string;
    author: {
      username: string;
      firstName?: string;
      lastName?: string;
    };
  }>;
  categoryStats: Array<{
    _id: string;
    postCount: number;
    totalViews: number;
    totalLikes: number;
    avgViews: number;
  }>;
  tagStats: Array<{
    _id: string;
    postCount: number;
    totalViews: number;
    totalLikes: number;
  }>;
  period: number;
}

interface TrafficAnalytics {
  dailyViews: Array<{
    date: string;
    views: number;
    posts: number;
  }>;
  popularContent: Array<{
    _id: string;
    title: string;
    slug: string;
    views: number;
    publishedAt: string;
  }>;
  trafficSources: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
  period: number;
  totalViews: number;
}

interface UserAnalytics {
  userRegistrations: Array<{
    _id: string;
    registrations: number;
  }>;
  userRoles: Array<{
    _id: string;
    count: number;
  }>;
  activeUsers: Array<{
    _id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    postCount: number;
    totalViews: number;
    totalLikes: number;
  }>;
  period: number;
}

interface MediaAnalytics {
  mediaUploads: Array<{
    _id: string;
    count: number;
    totalSize: number;
  }>;
  mediaTypes: Array<{
    _id: string;
    count: number;
    totalSize: number;
  }>;
  storageStats: {
    totalFiles: number;
    totalSize: number;
    avgSize: number;
  };
  popularMedia: Array<{
    _id: string;
    filename: string;
    originalName: string;
    size: number;
    type: string;
    url: string;
    uploadedAt: string;
  }>;
  period: number;
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [content, setContent] = useState<ContentPerformance | null>(null);
  const [traffic, setTraffic] = useState<TrafficAnalytics | null>(null);
  const [users, setUsers] = useState<UserAnalytics | null>(null);
  const [media, setMedia] = useState<MediaAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'traffic' | 'users' | 'media'>('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const params = { period: timeRange };
      
      const [overviewRes, contentRes, trafficRes, usersRes, mediaRes] = await Promise.all([
        analyticsAPI.getDashboardOverview(params),
        analyticsAPI.getContentPerformance(params),
        analyticsAPI.getTrafficAnalytics(params),
        analyticsAPI.getUserAnalytics(params).catch(() => null), // Users might require admin role
        analyticsAPI.getMediaAnalytics(params)
      ]);

      setOverview(overviewRes.data.data);
      setContent(contentRes.data.data);
      setTraffic(trafficRes.data.data);
      setUsers(usersRes?.data.data || null);
      setMedia(mediaRes.data.data);

    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      showToast.error(error.response?.data?.message || 'Failed to fetch analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      showToast.info('Preparing analytics export...');
      const response = await analyticsAPI.exportAnalytics({ 
        period: timeRange, 
        format: 'csv' 
      });
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${timeRange}d-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast.success('Analytics report downloaded');
    } catch (error: any) {
      console.error('Export failed:', error);
      showToast.error(error.response?.data?.message || 'Failed to export analytics');
    }
  };

  const getGrowthColor = (trend: string) => {
    if (trend === 'up') return 'text-green-500';
    if (trend === 'down') return 'text-red-500';
    return 'text-[var(--secondary)]';
  };

  const getGrowthIcon = (trend: string) => {
    if (trend === 'up') return ArrowUpRight;
    if (trend === 'down') return ArrowDownRight;
    return Minus;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const overviewMetrics = overview ? [
    {
      title: 'Total Views',
      value: formatNumber(overview.overview.totalViews),
      growth: overview.growth.views.value,
      trend: overview.growth.views.trend,
      icon: Eye,
      color: 'text-blue-500'
    },
    {
      title: 'Total Posts',
      value: overview.overview.totalPosts.toString(),
      growth: overview.growth.posts.value,
      trend: overview.growth.posts.trend,
      icon: FileText,
      color: 'text-green-500'
    },
    {
      title: 'Total Users',
      value: overview.overview.totalUsers.toString(),
      growth: overview.growth.users.value,
      trend: overview.growth.users.trend,
      icon: Users,
      color: 'text-purple-500'
    },
    {
      title: 'Total Likes',
      value: formatNumber(overview.overview.totalLikes),
      growth: overview.growth.likes.value,
      trend: overview.growth.likes.trend,
      icon: Heart,
      color: 'text-red-500'
    }
  ] : [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'traffic', label: 'Traffic', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'media', label: 'Media', icon: Image }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Analytics</h1>
          <p className="text-[var(--secondary)] mt-1">
            Track your content performance and audience engagement
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {(['7', '30', '90'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]'
                }`}
              >
                {range === '7' ? 'Last 7 days' :
                 range === '30' ? 'Last 30 days' :
                 'Last 90 days'}
              </button>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            icon={Download}
            onClick={handleExport}
          >
            Export
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const GrowthIcon = getGrowthIcon(metric.trend);
          
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover padding="lg">
                {isLoading ? (
                  <LoadingSkeleton lines={3} />
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg bg-[var(--surface)] ${metric.color}`}>
                        <Icon size={20} />
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${getGrowthColor(metric.trend)}`}>
                        <GrowthIcon size={14} />
                        {metric.growth > 0 ? '+' : ''}{metric.growth}%
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-[var(--foreground)] mb-1">
                      {metric.value}
                    </h3>
                    
                    <p className="text-[var(--secondary)] text-sm">
                      {metric.title}
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)]">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--secondary)] hover:text-[var(--foreground)]'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card padding="lg">
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">
                  Daily Views Trend
                </h2>
                {isLoading ? (
                  <LoadingSkeleton lines={8} />
                ) : (
                  <div className="space-y-4">
                    {traffic?.dailyViews?.slice(-7).map((day, index) => {
                      const maxViews = Math.max(...(traffic.dailyViews.map(d => d.views) || [1]));
                      return (
                        <div key={day.date} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--foreground)] font-medium">
                              {new Date(day.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <div className="flex items-center gap-4">
                              <span className="text-[var(--secondary)]">
                                {day.views} views
                              </span>
                              <span className="text-[var(--secondary)]">
                                {day.posts} posts
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-[var(--surface)] rounded-full h-2">
                            <div
                              className="bg-[var(--primary)] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(day.views / maxViews) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>

            <div>
              <Card padding="lg">
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">
                  Quick Stats
                </h2>
                {isLoading ? (
                  <LoadingSkeleton lines={6} />
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-[var(--secondary)]">Published Posts</span>
                      <span className="font-medium text-[var(--foreground)]">
                        {overview?.overview.publishedPosts}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--secondary)]">Draft Posts</span>
                      <span className="font-medium text-[var(--foreground)]">
                        {overview?.overview.draftPosts}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--secondary)]">Total Pages</span>
                      <span className="font-medium text-[var(--foreground)]">
                        {overview?.overview.totalPages}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--secondary)]">Media Files</span>
                      <span className="font-medium text-[var(--foreground)]">
                        {overview?.overview.totalMedia}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--secondary)]">Posts This Month</span>
                      <span className="font-medium text-[var(--foreground)]">
                        {overview?.overview.postsThisMonth}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--secondary)]">Posts This Week</span>
                      <span className="font-medium text-[var(--foreground)]">
                        {overview?.overview.postsThisWeek}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">
                Top Posts by Views
              </h2>
              {isLoading ? (
                <LoadingSkeleton lines={5} />
              ) : (
                <div className="space-y-4">
                  {content?.topPostsByViews?.slice(0, 5).map((post, index) => (
                    <div key={post._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--surface)] transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white text-sm flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[var(--foreground)] line-clamp-1 mb-1">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-[var(--secondary)]">
                          <div className="flex items-center gap-1">
                            <Eye size={12} />
                            {formatNumber(post.views)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart size={12} />
                            {post.likes?.length || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card padding="lg">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">
                Top Categories
              </h2>
              {isLoading ? (
                <LoadingSkeleton lines={5} />
              ) : (
                <div className="space-y-4">
                  {content?.categoryStats?.slice(0, 5).map((category, index) => (
                    <div key={category._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--surface)] transition-colors">
                      <div>
                        <h4 className="font-medium text-[var(--foreground)] capitalize">
                          {category._id || 'Uncategorized'}
                        </h4>
                        <p className="text-sm text-[var(--secondary)]">
                          {category.postCount} posts
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-[var(--foreground)]">
                          {formatNumber(category.totalViews)}
                        </div>
                        <div className="text-sm text-[var(--secondary)]">
                          views
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Traffic Tab */}
        {activeTab === 'traffic' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card padding="lg">
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">
                  Popular Content
                </h2>
                {isLoading ? (
                  <LoadingSkeleton lines={5} />
                ) : (
                  <div className="space-y-4">
                    {traffic?.popularContent?.map((post, index) => (
                      <div key={post._id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-[var(--surface)] transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-[var(--foreground)] mb-1">
                            {post.title}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-[var(--secondary)]">
                            <div className="flex items-center gap-1">
                              <Eye size={12} />
                              {formatNumber(post.views)} views
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(post.publishedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <div>
              <Card padding="lg">
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">
                  Traffic Sources
                </h2>
                {isLoading ? (
                  <LoadingSkeleton lines={5} />
                ) : (
                  <div className="space-y-4">
                    {traffic?.trafficSources?.map((source, index) => (
                      <div key={source.source} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[var(--foreground)] font-medium">
                            {source.source}
                          </span>
                          <span className="text-[var(--secondary)]">
                            {source.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-[var(--surface)] rounded-full h-3">
                          <div
                            className="bg-[var(--primary)] h-3 rounded-full transition-all duration-300"
                            style={{ width: `${source.percentage}%` }}
                          />
                        </div>
                        <div className="text-sm text-[var(--secondary)]">
                          {formatNumber(source.visits)} visits
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">
                Active Authors
              </h2>
              {isLoading ? (
                <LoadingSkeleton lines={5} />
              ) : users?.activeUsers ? (
                <div className="space-y-4">
                  {users.activeUsers.slice(0, 5).map((user, index) => (
                    <div key={user._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--surface)] transition-colors">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-medium">
                          {(user.firstName?.[0] || user.username[0]).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-[var(--foreground)]">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : user.username
                          }
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-[var(--secondary)]">
                          <span>{user.postCount} posts</span>
                          <span>{formatNumber(user.totalViews)} views</span>
                          <span>{user.totalLikes} likes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--secondary)]">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>User analytics require admin permissions</p>
                </div>
              )}
            </Card>

            <Card padding="lg">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">
                User Roles
              </h2>
              {isLoading ? (
                <LoadingSkeleton lines={4} />
              ) : users?.userRoles ? (
                <div className="space-y-4">
                  {users.userRoles.map((role) => (
                    <div key={role._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--surface)] transition-colors">
                      <span className="font-medium text-[var(--foreground)] capitalize">
                        {role._id}
                      </span>
                      <span className="text-[var(--primary)] font-bold">
                        {role.count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--secondary)]">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>User analytics require admin permissions</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">
                Storage Overview
              </h2>
              {isLoading ? (
                <LoadingSkeleton lines={4} />
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-[var(--secondary)]">Total Files</span>
                    <span className="font-medium text-[var(--foreground)]">
                      {media?.storageStats.totalFiles || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--secondary)]">Storage Used</span>
                    <span className="font-medium text-[var(--foreground)]">
                      {formatBytes(media?.storageStats.totalSize || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--secondary)]">Average File Size</span>
                    <span className="font-medium text-[var(--foreground)]">
                      {formatBytes(media?.storageStats.avgSize || 0)}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            <Card padding="lg">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">
                File Types
              </h2>
              {isLoading ? (
                <LoadingSkeleton lines={4} />
              ) : (
                <div className="space-y-4">
                  {media?.mediaTypes?.map((type) => (
                    <div key={type._id} className="flex items-center justify-between">
                      <span className="text-[var(--foreground)] font-medium uppercase">
                        {type._id || 'Unknown'}
                      </span>
                      <div className="text-right">
                        <div className="font-medium text-[var(--foreground)]">
                          {type.count}
                        </div>
                        <div className="text-sm text-[var(--secondary)]">
                          {formatBytes(type.totalSize)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card padding="lg">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">
                Recent Uploads
              </h2>
              {isLoading ? (
                <LoadingSkeleton lines={4} />
              ) : (
                <div className="space-y-3">
                  {media?.popularMedia?.slice(0, 5).map((file) => (
                    <div key={file._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--surface)] transition-colors">
                      <div className="w-8 h-8 rounded bg-[var(--surface)] flex items-center justify-center">
                        <Image size={16} className="text-[var(--secondary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--foreground)] truncate">
                          {file.originalName}
                        </p>
                        <p className="text-sm text-[var(--secondary)]">
                          {formatBytes(file.size)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
}