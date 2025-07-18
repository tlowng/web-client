// src/pages/ForumTopicPage.tsx
import { useParams } from 'react-router-dom';
import { useFetch } from '@/hooks/use-fetch';
import { getTopicBySlug, getPostsByTopic } from '@/api';
import type { ForumTopic, ForumPost } from '@/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, Eye, MessageSquare } from 'lucide-react';
import { useBreadcrumbTitle } from '@/contexts/breadcrumb-context';
import { useCallback } from 'react';

export default function ForumTopicPage() {
  const { slug } = useParams<{ slug: string }>();

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

  const { data: posts, loading: postsLoading, error: postsError } = useFetch<ForumPost[]>(
    fetchPostsWithTopic,
    [],
    [topic?._id] // Only refetch when topic._id changes
  );

  // Set breadcrumb title when topic is loaded
  useBreadcrumbTitle(topic?.title || 'Topic');

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
                    <span>{topic.postCount || topic.replyCount || 0} replies</span>
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
                {topic.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-muted rounded"
                  >
                    {tag}
                  </span>
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
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <ThumbsUp size={16} />
                  <span>{post.likeCount || 0}</span>
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    Reply
                  </Button>
                  <Button variant="ghost" size="sm">
                    Quote
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {topic && !topic.isLocked && (
        <Card>
          <CardHeader>
            <CardTitle>Your Reply</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Write your reply here..." 
              className="min-h-[120px]"
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Preview
              </Button>
              <Button variant="outline" size="sm">
                Attach
              </Button>
            </div>
            <Button>Post Reply</Button>
          </CardFooter>
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