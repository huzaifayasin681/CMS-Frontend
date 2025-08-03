'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Crown, 
  Edit3, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Settings,
  Trash2,
  Shield,
  ShieldX,
  Key,
  Plus,
  Edit,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/Toast';
import { authAPI, userManagementAPI } from '@/lib/api';
import { useAuthStore, usePermissions } from '@/lib/auth';
import CreateUserModal from '@/components/dashboard/CreateUserModal';
import Link from 'next/link';

interface User {
  _id: string;
  id?: string;
  username: string;
  email: string;
  role: 'superadmin' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'rejected';
  isActive: boolean;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  bio?: string;
  approvedBy?: {
    username: string;
    email: string;
  };
  approvedAt?: string;
  createdAt: string;
  lastLogin?: string;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  recent: number;
  byRole: {
    superadmin: number;
    admin: number;
    editor: number;
    viewer: number;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Modal Component for User Actions
const UserActionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'danger',
  loading = false,
  children 
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
  children?: React.ReactNode;
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: 'text-red-600 bg-red-100',
    warning: 'text-yellow-600 bg-yellow-100',
    info: 'text-blue-600 bg-blue-100'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
          aria-hidden="true" 
          onClick={onClose}
        />

        {/* Modal Content */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-50 border border-gray-200">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${typeStyles[type]} sm:mx-0 sm:h-10 sm:w-10`}>
                {type === 'danger' && <XCircle className="h-6 w-6" />}
                {type === 'warning' && <Shield className="h-6 w-6" />}
                {type === 'info' && <Settings className="h-6 w-6" />}
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{message}</p>
                  {children}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-gray-50 to-red-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
            <Button
              onClick={onConfirm}
              disabled={loading}
              variant={type === 'danger' ? 'danger' : 'primary'}
              className="w-full inline-flex justify-center sm:ml-3 sm:w-auto relative z-10 pointer-events-auto"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Confirm'}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="mt-3 w-full inline-flex justify-center sm:mt-0 sm:ml-3 sm:w-auto relative z-10 pointer-events-auto"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Modal states
  const [modalState, setModalState] = useState<{
    type: 'delete' | 'activate' | 'deactivate' | 'resetPassword' | null;
    user: User | null;
    data?: any;
  }>({ type: null, user: null });

  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);

  const { user: currentUser } = useAuthStore();
  const permissions = usePermissions();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'pending') {
      setActiveTab('pending');
    }
  }, [searchParams]);

  useEffect(() => {
    if (permissions.canManageUsers) {
      fetchUsers();
      fetchUserStats();
      fetchPendingUsers();
    }
  }, [permissions.canManageUsers, pagination.page, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;

      const response = permissions.canManageUsers 
        ? await userManagementAPI.getAllUsers(params)
        : await authAPI.getAllUsers(params);
      
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (!permissions.canManageUsers) return;
    
    try {
      const response = await userManagementAPI.getUserStats();
      setUserStats(response.data.stats);
    } catch (error: any) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const response = await authAPI.getPendingUsers();
      setPendingUsers(response.data.users);
    } catch (error: any) {
      console.error('Failed to fetch pending users:', error);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      setActionLoading(userId);
      await authAPI.approveUser(userId);
      showToast.success('User approved successfully');
      fetchUsers();
      fetchPendingUsers();
      fetchUserStats();
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      setActionLoading(userId);
      await authAPI.rejectUser(userId);
      showToast.success('User rejected successfully');
      fetchUsers();
      fetchPendingUsers();
      fetchUserStats();
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to reject user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!modalState.user || !permissions.isSuperAdmin) {
      console.log('Delete user denied:', { user: modalState.user, isSuperAdmin: permissions.isSuperAdmin });
      return;
    }

    console.log('Deleting user:', modalState.user._id);
    try {
      setActionLoading(modalState.user._id);
      const response = await userManagementAPI.deleteUser(modalState.user._id);
      console.log('Delete user response:', response);
      showToast.success('User deleted successfully');
      fetchUsers();
      fetchUserStats();
      setModalState({ type: null, user: null });
    } catch (error: any) {
      console.error('Delete user error:', error);
      showToast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivateUser = async () => {
    if (!modalState.user || !permissions.isSuperAdmin) {
      console.log('Activate user denied:', { user: modalState.user, isSuperAdmin: permissions.isSuperAdmin });
      return;
    }

    console.log('Activating user:', modalState.user._id);
    try {
      setActionLoading(modalState.user._id);
      const response = await userManagementAPI.activateUser(modalState.user._id);
      console.log('Activate user response:', response);
      showToast.success('User activated successfully');
      fetchUsers();
      fetchUserStats();
      setModalState({ type: null, user: null });
    } catch (error: any) {
      console.error('Activate user error:', error);
      showToast.error(error.response?.data?.message || 'Failed to activate user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivateUser = async () => {
    if (!modalState.user || !permissions.isSuperAdmin) {
      console.log('Deactivate user denied:', { user: modalState.user, isSuperAdmin: permissions.isSuperAdmin });
      return;
    }

    console.log('Deactivating user:', modalState.user._id);
    try {
      setActionLoading(modalState.user._id);
      const response = await userManagementAPI.deactivateUser(modalState.user._id);
      console.log('Deactivate user response:', response);
      showToast.success('User deactivated successfully');
      fetchUsers();
      fetchUserStats();
      setModalState({ type: null, user: null });
    } catch (error: any) {
      console.error('Deactivate user error:', error);
      showToast.error(error.response?.data?.message || 'Failed to deactivate user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async () => {
    if (!modalState.user || !modalState.data?.newPassword || !permissions.isSuperAdmin) return;

    try {
      setActionLoading(modalState.user._id);
      await userManagementAPI.resetUserPassword(modalState.user._id, modalState.data.newPassword);
      showToast.success('Password reset successfully');
      setModalState({ type: null, user: null });
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUserCreated = () => {
    fetchUsers();
    fetchUserStats();
    fetchPendingUsers();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin': return <Crown className="w-4 h-4 text-purple-500" />;
      case 'admin': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'editor': return <Edit3 className="w-4 h-4 text-blue-500" />;
      default: return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </span>;
    }
    
    switch (user.status) {
      case 'active':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </span>;
      default:
        return null;
    }
  };

  if (!permissions.canManageUsers) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <UserX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500">You need Admin or SuperAdmin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage user accounts, roles, and permissions</p>
        </div>
        
        <Button
          onClick={() => setCreateUserModalOpen(true)}
          variant="primary"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Create New User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4 hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-blue-300">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{userStats?.total || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-blue-300">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-semibold text-gray-900">{userStats?.active || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-blue-300">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Inactive</p>
              <p className="text-2xl font-semibold text-gray-900">{userStats?.inactive || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-blue-300">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{userStats?.pending || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-blue-300">
          <div className="flex items-center">
            <Crown className="w-8 h-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Admins</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(userStats?.byRole.admin || 0) + (userStats?.byRole.superadmin || 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Users ({userStats?.total || 0})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Approval ({pendingUsers.length})
          </button>
        </nav>
      </div>

      {/* Filters */}
      {activeTab === 'all' && (
        <Card className="p-4 hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-blue-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="superadmin">SuperAdmin</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(activeTab === 'all' ? users : pendingUsers).map((user) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName || user.lastName 
                              ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                              : user.username
                            }
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.username !== (user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.username) && (
                            <div className="text-xs text-gray-400">@{user.username}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getRoleIcon(user.role)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">
                            {user.role}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-1.5">
                          {activeTab === 'pending' ? (
                            // Pending approval actions
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(user._id)}
                                disabled={actionLoading === user._id}
                                className="text-green-600 hover:text-white hover:bg-green-600 border-green-300 hover:border-green-600 px-3 py-1.5 rounded-md transition-all duration-200 font-medium"
                              >
                                {actionLoading === user._id ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <>
                                    <UserCheck className="w-3 h-3 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(user._id)}
                                disabled={actionLoading === user._id}
                                className="text-red-600 hover:text-white hover:bg-red-600 border-red-300 hover:border-red-600 px-3 py-1.5 rounded-md transition-all duration-200 font-medium"
                              >
                                <UserX className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          ) : (
                            // SuperAdmin management actions
                            permissions.isSuperAdmin && (
                              <>
                                {user.isActive ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setModalState({ type: 'deactivate', user })}
                                    disabled={user._id === currentUser?.id}
                                    className="text-orange-600 hover:text-white hover:bg-orange-600 border-orange-300 hover:border-orange-600 px-2 py-1.5 rounded-md transition-all duration-200 font-medium text-xs"
                                  >
                                    <ShieldX className="w-3 h-3 mr-1" />
                                    Deactivate
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setModalState({ type: 'activate', user })}
                                    className="text-green-600 hover:text-white hover:bg-green-600 border-green-300 hover:border-green-600 px-2 py-1.5 rounded-md transition-all duration-200 font-medium text-xs"
                                  >
                                    <Shield className="w-3 h-3 mr-1" />
                                    Activate
                                  </Button>
                                )}
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setModalState({ type: 'resetPassword', user })}
                                  className="text-blue-600 hover:text-white hover:bg-blue-600 border-blue-300 hover:border-blue-600 px-2 py-1.5 rounded-md transition-all duration-200 font-medium text-xs"
                                >
                                  <Key className="w-3 h-3 mr-1" />
                                  Reset
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setModalState({ type: 'delete', user })}
                                  disabled={user._id === currentUser?.id}
                                  className="text-red-600 hover:text-white hover:bg-red-600 border-red-300 hover:border-red-600 px-2 py-1.5 rounded-md transition-all duration-200 font-medium text-xs"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </Button>
                              </>
                            )
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {activeTab === 'all' && pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      of <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="rounded-l-md"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                        const startPage = Math.max(1, pagination.page - 2);
                        const page = startPage + i;
                        if (page > pagination.pages) return null;
                        return (
                          <Button
                            key={page}
                            variant={page === pagination.page ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="rounded-none"
                          >
                            {page}
                          </Button>
                        );
                      })}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="rounded-r-md"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Action Modals */}
      <UserActionModal
        isOpen={modalState.type === 'delete'}
        onClose={() => setModalState({ type: null, user: null })}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${modalState.user?.username}? This action cannot be undone.`}
        type="danger"
        loading={actionLoading === modalState.user?._id}
      />

      <UserActionModal
        isOpen={modalState.type === 'activate'}
        onClose={() => setModalState({ type: null, user: null })}
        onConfirm={handleActivateUser}
        title="Activate User"
        message={`Are you sure you want to activate ${modalState.user?.username}? They will be able to log in and access the system.`}
        type="info"
        loading={actionLoading === modalState.user?._id}
      />

      <UserActionModal
        isOpen={modalState.type === 'deactivate'}
        onClose={() => setModalState({ type: null, user: null })}
        onConfirm={handleDeactivateUser}
        title="Deactivate User"
        message={`Are you sure you want to deactivate ${modalState.user?.username}? They will not be able to log in until reactivated.`}
        type="warning"
        loading={actionLoading === modalState.user?._id}
      />

      <UserActionModal
        isOpen={modalState.type === 'resetPassword'}
        onClose={() => setModalState({ type: null, user: null })}
        onConfirm={handleResetPassword}
        title="Reset Password"
        message={`Enter a new password for ${modalState.user?.username}:`}
        type="info"
        loading={actionLoading === modalState.user?._id}
      >
        <div className="mt-4">
          <Input
            type="password"
            placeholder="New password (min 6 characters)"
            value={modalState.data?.newPassword || ''}
            onChange={(e) => setModalState(prev => ({ 
              ...prev, 
              data: { ...prev.data, newPassword: e.target.value }
            }))}
            className="w-full"
          />
        </div>
      </UserActionModal>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={createUserModalOpen}
        onClose={() => setCreateUserModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}