'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Image,
  Users,
  Eye,
  TrendingUp,
  Calendar,
  Clock,
  Plus,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, LoadingSkeleton } from '@/components/ui/LoadingSpinner';
import { useAuthStore, usePermissions } from '@/lib/auth';
import { analyticsAPI } from '@/lib/api';
import Link from 'next/link';

interface DashboardStats {
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
}

interface DashboardGrowth {
  posts: { value: number; trend: 'up' | 'down' | 'stable' };
  views: { value: number; trend: 'up' | 'down' | 'stable' };
  users: { value: number; trend: 'up' | 'down' | 'stable' };
  likes: { value: number; trend: 'up' | 'down' | 'stable' };
}

interface RecentActivity {
  id: string;
  type: 'post' | 'page' | 'media' | 'comment';
  title: string;
  action: string;
  timestamp: string;
  user: string;
}

interface QuickStat {
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ElementType;
  href?: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const permissions = usePermissions();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [growth, setGrowth] = useState<DashboardGrowth | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch real analytics data
        const overviewRes = await analyticsAPI.getDashboardOverview({ period: '30' });
        const data = overviewRes.data.data;
        
        setStats(data.overview);
        setGrowth(data.growth);

        // Mock recent activity for now - could be enhanced with real activity tracking
        setRecentActivity([
          {
            id: '1',
            type: 'post',
            title: 'Getting Started with Content Hub',
            action: 'Published',
            timestamp: '2 hours ago',
            user: user?.username || 'You'
          },
          {
            id: '2',
            type: 'media',
            title: 'hero-image.jpg',
            action: 'Uploaded',
            timestamp: '4 hours ago',
            user: user?.username || 'You'
          },
          {
            id: '3',
            type: 'page',
            title: 'About Us',
            action: 'Updated',
            timestamp: '1 day ago',
            user: user?.username || 'You'
          }
        ]);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Fallback to mock data if API fails
        setStats({
          totalPosts: 0,
          totalPages: 0,
          totalUsers: 0,
          totalMedia: 0,
          publishedPosts: 0,
          draftPosts: 0,
          totalViews: 0,
          totalLikes: 0,
          postsThisMonth: 0,
          postsThisWeek: 0
        });
        setGrowth({
          posts: { value: 0, trend: 'stable' },
          views: { value: 0, trend: 'stable' },
          users: { value: 0, trend: 'stable' },
          likes: { value: 0, trend: 'stable' }
        });
        setRecentActivity([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getChangeType = (trend: string): 'increase' | 'decrease' | 'neutral' => {
    if (trend === 'up') return 'increase';
    if (trend === 'down') return 'decrease';
    return 'neutral';
  };

  const quickStats: QuickStat[] = [
    {
      name: 'Total Posts',
      value: stats?.totalPosts.toString() || '0',
      change: growth ? `${growth.posts.value > 0 ? '+' : ''}${growth.posts.value}%` : '+0%',
      changeType: growth ? getChangeType(growth.posts.trend) : 'neutral',
      icon: FileText,
      href: '/dashboard/posts'
    },
    {
      name: 'Total Views',
      value: stats ? formatNumber(stats.totalViews) : '0',
      change: growth ? `${growth.views.value > 0 ? '+' : ''}${growth.views.value}%` : '+0%',
      changeType: growth ? getChangeType(growth.views.trend) : 'neutral',
      icon: Eye,
      href: '/dashboard/analytics'
    },
    {
      name: 'Media Files',
      value: stats?.totalMedia.toString() || '0',
      change: '+0%',
      changeType: 'neutral',
      icon: Image,
      href: '/dashboard/media'
    },
    {
      name: 'Published',
      value: stats?.publishedPosts.toString() || '0',
      change: growth ? `${growth.posts.value > 0 ? '+' : ''}${growth.posts.value}%` : '+0%',
      changeType: growth ? getChangeType(growth.posts.trend) : 'neutral',
      icon: TrendingUp,
      href: '/dashboard/posts?status=published'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post': return FileText;
      case 'page': return FileText;
      case 'media': return Image;
      case 'comment': return Users;
      default: return FileText;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'post': return 'text-blue-500';
      case 'page': return 'text-green-500';
      case 'media': return 'text-purple-500';
      case 'comment': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
              Welcome back, {user?.firstName || user?.username}! 👋
            </h1>
            <p className="text-[var(--secondary)]">
              Here is what is happening with your content today.
            </p>
          </div>
          
          {permissions.canCreate && (
            <div className="flex gap-3">
              <Link href="/dashboard/posts/new">
                <Button icon={Plus}>
                  New Post
                </Button>
              </Link>
              <Link href="/dashboard/pages/new">
                <Button variant="outline" icon={Plus}>
                  New Page
                </Button>
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const StatIcon = stat.icon;
          const content = (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover padding="lg" className="h-full">
                {isLoading ? (
                  <LoadingSkeleton lines={3} />
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[var(--secondary)] text-sm font-medium mb-1">
                        {stat.name}
                      </p>
                      <p className="text-2xl font-bold text-[var(--foreground)] mb-1">
                        {stat.value}
                      </p>
                      <div className={`flex items-center gap-1 text-sm ${
                        stat.changeType === 'increase' ? 'text-green-500' :
                        stat.changeType === 'decrease' ? 'text-red-500' : 'text-[var(--secondary)]'
                      }`}>
                        <TrendingUp size={14} />
                        {stat.change}
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20`}>
                      <StatIcon className="w-6 h-6 text-[var(--primary)]" />
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          );

          return stat.href ? (
            <Link key={stat.name} href={stat.href}>
              {content}
            </Link>
          ) : (
            <div key={stat.name}>{content}</div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                Recent Activity
              </h2>
              <Link href="/dashboard/activity">
                <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                  View All
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg skeleton" />
                    <div className="flex-1">
                      <LoadingSkeleton lines={2} />
                    </div>
                  </div>
                ))
              ) : (
                recentActivity.map((activity, index) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + (index * 0.1) }}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--surface)] transition-colors"
                    >
                      <div className={`p-2 rounded-lg bg-[var(--surface)] ${getActivityColor(activity.type)}`}>
                        <ActivityIcon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[var(--foreground)] font-medium truncate">
                          {activity.title}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-[var(--secondary)]">
                          <span>{activity.action} by {activity.user}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {activity.timestamp}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions & Analytics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          {permissions.canCreate && (
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link href="/dashboard/posts/new">
                  <Button variant="outline" fullWidth icon={FileText}>
                    Create Post
                  </Button>
                </Link>
                <Link href="/dashboard/media">
                  <Button variant="outline" fullWidth icon={Image}>
                    Upload Media
                  </Button>
                </Link>
                <Link href="/dashboard/analytics">
                  <Button variant="outline" fullWidth icon={BarChart3}>
                    View Analytics
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Publishing Schedule */}
          <Card padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[var(--primary)]" />
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                Schedule
              </h3>
            </div>
            
            {isLoading ? (
              <LoadingSkeleton lines={3} />
            ) : (
              <div className="space-y-3">
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-[var(--secondary)] mx-auto mb-3" />
                  <p className="text-[var(--secondary)] text-sm">
                    No scheduled posts
                  </p>
                  <Link href="/dashboard/schedule">
                    <Button variant="ghost" size="sm" className="mt-2">
                      View Schedule
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}