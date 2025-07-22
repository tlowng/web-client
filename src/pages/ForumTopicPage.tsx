// src/pages/ForumTopicPage.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '@/hooks/use-fetch';
import { getTopicBySlug, getPostsByTopic, createForumPost, likeForumPost, deleteForumPost } from '@/api';
import type { ForumTopic, ForumPost, UserProfile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, Eye, MessageSquare, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useBreadcrumbTitle } from '@/contexts/breadcrumb-context';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { getMe } from '@/api';

export default function ForumTopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Fetch current user
  React.useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = await getMe();
          setCurrentUser(user);
        } catch (error) {
          console.error('Failed to fetch user:', error);
        }
      }
    };
    fetchUser();
  }, []);

  // Fixed: Use stable function references to prevent infinite re-renders
  const fetchTopic = useCallback(async () => {
    if (!slug) throw new Error('Topic slug is required');
    return await getTopicBySlug(slug);
  }, [slug]);

  const { data: topic, loading: topicLoading, error: topicError } = useFetch<ForumTopic>(
    fetchTopic,
    null,
    [slug]
  );

  // Create a separate fetcher for posts that depends on topic._id
  const fetchPostsWithTopic = useCallback(async () => {
    if (!topic?._id) return [];
    return await getPostsByTopic(topic._id);
  }, [topic?._id]);

  const { data: posts, loading: postsLoading, error: postsError, refetch: refetchPosts } = useFetch<ForumPost[]>(
    fetchPostsWithTopic,
    [],
    [topic?._id] // Only refetch when topic._id changes
  );

  // Set breadcrumb title when topic is loaded
  useBreadcrumbTitle(topic?.title || 'Topic');

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic?._id || !replyContent.trim()) return;

    setSubmitting(true);
    try {
      await createForumPost({
        content: replyContent,
        topicId: topic._id,
        replyToPostId: replyingTo || undefined,
      });
      
      toast.success('Reply posted successfully!');
      setReplyContent('');
      setReplyingTo(null);
      
      // Refetch posts
      await refetchPosts();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to post reply';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!currentUser) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const response = await likeForumPost(postId);
      toast.success(response.data.liked ? 'Post liked!' : 'Like removed');
      
      // Refetch posts to update like counts
      await refetchPosts();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to like post';
      toast.error(message);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await deleteForumPost(postId);
      toast.success('Post deleted successfully');
      
      // Refetch posts
      await refetchPosts();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete post';
      toast.error(message);
    }
  };

  if (topicError) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-red-500">
              <p>Error loading topic: {topicError}</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {topicLoading ? (
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <div className="h-6 bg-muted animate-pulse rounded w-3/4"></div>
              <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded"></div>
              <div className="h-4 bg-muted animate-pulse rounded"></div>
              <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      ) : topic ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{topic.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>By {topic.author.username}</span>
                  <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1">
                    <Eye size={14} />
                    <span>{topic.viewCount} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare size={14} />
                    <span>{topic.replyCount  || topic.replyCount || 0} replies</span>
                  </div>
                </div>
              </div>
              {(topic.isPinned || topic.isLocked) && (
                <div className="flex gap-2">
                  {topic.isPinned && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      Pinned
                    </span>
                  )}
                  {topic.isLocked && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                      Locked
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: topic.content }} 
            />
            {topic.tags && topic.tags.length > 0 && (
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">Tags:</span>
                {topic?.tags?.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Topic not found.</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Replies</h2>
        {posts && posts.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {posts.length} {posts.length === 1 ? 'reply' : 'replies'}
          </span>
        )}
      </div>

      {postsLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="w-10 h-10 bg-muted animate-pulse rounded-full"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
                  <div className="h-3 bg-muted animate-pulse rounded w-32"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : postsError ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-red-500">
              <p>Error loading replies: {postsError}</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : !posts || posts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No replies yet. Be the first to reply!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post._id}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar>
                  <AvatarImage 
                    src={`https://github.com/${post.author.username}.png`} 
                    alt={post.author.username} 
                  />
                  <AvatarFallback>
                    {post.author.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{post.author.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <Button 
                  variant={post.userLiked ? "default" : "outline"} 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => handleLikePost(post._id)}
                >
                  <ThumbsUp size={16} />
                  <span>{post.likeCount || 0}</span>
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setReplyingTo(post._id);
                      // Scroll to reply form
                      document.getElementById('reply-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Reply
                  </Button>
                  {currentUser && (currentUser._id === post.author._id || currentUser.role === 'admin') && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeletePost(post._id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {topic && !topic.isLocked && currentUser && (
        <Card id="reply-form">
          <CardHeader>
            <CardTitle>
              {replyingTo ? 'Reply to Post' : 'Your Reply'}
            </CardTitle>
            {replyingTo && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setReplyingTo(null)}
              >
                Cancel reply
              </Button>
            )}
          </CardHeader>
          <form onSubmit={handleSubmitReply}>
            <CardContent>
              <Textarea 
                placeholder="Write your reply here..." 
                className="min-h-[120px]"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" disabled>
                  Preview
                </Button>
                <Button type="button" variant="outline" size="sm" disabled>
                  Attach
                </Button>
              </div>
              <Button type="submit" disabled={submitting || !currentUser}>
                {submitting ? 'Posting...' : 'Post Reply'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {topic && !topic.isLocked && !currentUser && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Please login to reply to this topic.</p>
            <Button asChild className="mt-4">
              <Link to="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {topic?.isLocked && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">This topic is locked. No new replies can be posted.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}