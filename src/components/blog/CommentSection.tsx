'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  Trash2, 
  User,
  Send,
  MoreHorizontal 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { showToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/lib/auth';
import { commentsAPI } from '@/lib/api';
import Link from 'next/link';

interface Comment {
  _id: string;
  id?: string; // Support both _id and id
  content: string;
  author: {
    _id: string;
    id?: string;
    username: string;
    avatar?: string;
  };
  post: string;
  parentComment?: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  likes: string[];
  replies: Comment[];
  createdAt: string;
  updatedAt: string;
}

interface CommentSectionProps {
  postId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await commentsAPI.getComments(postId);
      // Handle different response structures
      const commentsData = response.data.data?.comments || response.data.comments || response.data || [];
      
      // Transform comments to ensure consistent ID handling
      const transformedComments = (Array.isArray(commentsData) ? commentsData : []).map((comment: any) => ({
        ...comment,
        id: comment._id || comment.id,
        author: comment.author ? {
          ...comment.author,
          id: comment.author._id || comment.author.id
        } : {
          _id: 'unknown',
          id: 'unknown',
          username: 'Anonymous',
          avatar: null
        },
        replies: comment.replies?.map((reply: any) => ({
          ...reply,
          id: reply._id || reply.id,
          author: reply.author ? {
            ...reply.author,
            id: reply.author._id || reply.author.id
          } : {
            _id: 'unknown',
            id: 'unknown',
            username: 'Anonymous',
            avatar: null
          }
        })) || []
      }));
      
      setComments(transformedComments);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const submitComment = async (content: string, parentCommentId?: string) => {
    if (!isAuthenticated) {
      showToast.error('Please login to comment');
      return;
    }

    if (!content.trim()) {
      showToast.error('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      await commentsAPI.createComment(postId, {
        content: content.trim(),
        parentComment: parentCommentId || undefined,
      });

      showToast.success('Comment posted successfully!');
      
      // Reset form
      if (parentCommentId) {
        setReplyContent('');
        setReplyingTo(null);
      } else {
        setNewComment('');
      }

      // Refresh comments
      fetchComments();
    } catch (error) {
      console.error('Failed to submit comment:', error);
      showToast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCommentLike = async (commentId: string) => {
    if (!isAuthenticated) {
      showToast.error('Please login to like comments');
      return;
    }

    try {
      await commentsAPI.toggleCommentLike(commentId);
      // Refresh comments to get updated like count
      fetchComments();
    } catch (error) {
      console.error('Failed to toggle like:', error);
      showToast.error('Failed to toggle like');
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!isAuthenticated) {
      return;
    }

    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await commentsAPI.deleteComment(commentId);
        showToast.success('Comment deleted successfully');
        fetchComments();
      } catch (error) {
        console.error('Failed to delete comment:', error);
        showToast.error('Failed to delete comment');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({ 
    comment, 
    isReply = false 
  }) => {
    const userId = user?.id;
    const commentAuthorId = comment.author.id || comment.author._id;
    const isLiked = user && userId && comment.likes.includes(userId);
    const canDelete = user && userId && (userId === commentAuthorId || user.role === 'admin' || user.role === 'superadmin');

    return (
      <Card 
        padding="md" 
        className={`${isReply ? 'ml-6 mt-3' : 'mb-4'} transition-all duration-200`}
      >
        <div className="flex gap-3">
          {comment.author.avatar ? (
            <img
              src={comment.author.avatar}
              alt={comment.author.username}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-[var(--foreground)]">
                {comment.author.username}
              </span>
              <span className="text-sm text-[var(--secondary)]">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            
            <p className="text-[var(--foreground)] mb-3 whitespace-pre-wrap">
              {comment.content}
            </p>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleCommentLike(comment._id || comment.id || '')}
                disabled={!isAuthenticated}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  !isAuthenticated 
                    ? 'text-[var(--secondary)] opacity-50 cursor-not-allowed'
                    : isLiked 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-[var(--secondary)] hover:text-[var(--primary)]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                {comment.likes?.length || 0}
              </button>
              
              {!isReply && isAuthenticated && (
                <button
                  onClick={() => {
                    const commentId = comment._id || comment.id || '';
                    setReplyingTo(replyingTo === commentId ? null : commentId);
                  }}
                  className="flex items-center gap-1 text-sm text-[var(--secondary)] hover:text-[var(--primary)] transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </button>
              )}
              
              {canDelete && (
                <button
                  onClick={() => deleteComment(comment._id || comment.id || '')}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
            
            {/* Reply Form */}
            {replyingTo === (comment._id || comment.id) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className="flex gap-2">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Reply to ${comment.author.username}...`}
                    className="flex-1 p-2 border border-[var(--border)] rounded-lg resize-none bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    rows={2}
                  />
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      onClick={() => submitComment(replyContent, comment._id || comment.id)}
                      disabled={!replyContent.trim() || isSubmitting}
                      icon={Send}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply._id || reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </Card>
    );
  };

  return (
    <section className="mt-12 pt-8 border-t border-[var(--border)]">
      <h3 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6" />
        Comments ({comments.length})
      </h3>
      
      {/* Comment Form */}
      <Card padding="lg" className="mb-8">
        {isAuthenticated ? (
          <div className="space-y-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-3 border border-[var(--border)] rounded-lg resize-none bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              rows={3}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--secondary)]">
                {newComment.length}/1000 characters
              </span>
              <Button
                onClick={() => submitComment(newComment)}
                disabled={!newComment.trim() || isSubmitting}
                icon={Send}
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-[var(--secondary)] mb-4">
              Please log in to join the conversation
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/login">
                <Button>Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline">Register</Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
      
      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} padding="md">
              <div className="animate-pulse">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-[var(--surface)] rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-[var(--surface)] rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-[var(--surface)] rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-[var(--surface)] rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <motion.div
              key={comment._id || comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CommentItem comment={comment} />
            </motion.div>
          ))}
        </div>
      ) : (
        <Card padding="lg" className="text-center">
          <MessageCircle className="w-12 h-12 text-[var(--secondary)] mx-auto mb-4" />
          <p className="text-[var(--secondary)]">
            No comments yet. Be the first to share your thoughts!
          </p>
        </Card>
      )}
    </section>
  );
};