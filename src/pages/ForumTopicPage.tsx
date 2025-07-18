// src/pages/ForumTopicPage.tsx
import { useParams } from 'react-router-dom';
import { useFetch } from '@/hooks/use-fetch';
import { getTopicBySlug, getPostsByTopic } from '@/api';
import type { ForumTopic, ForumPost } from '@/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp } from 'lucide-react';

export default function ForumTopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: topic, loading: topicLoading } = useFetch<ForumTopic>(() => getTopicBySlug(slug!));
  // Fetch posts only after the topic data (and thus topic._id) is available
  const { data: posts, loading: postsLoading } = useFetch<ForumPost[]>(() => 
    topic ? getPostsByTopic(topic._id) : Promise.resolve({ data: [] })
  );

  return (
    <div className="p-4 space-y-6">
      {topicLoading ? (
        <p>Loading topic...</p>
      ) : topic ? (
        <Card>
          <CardHeader>
            <CardTitle>{topic.title}</CardTitle>
            <div className="text-sm text-muted-foreground">
              By {topic.author.username} on {new Date(topic.createdAt).toLocaleDateString()}
            </div>
          </CardHeader>
          <CardContent>
            <div dangerouslySetInnerHTML={{ __html: topic.content }} />
          </CardContent>
        </Card>
      ) : (
        <p>Topic not found.</p>
      )}

      <h2 className="text-2xl font-semibold">Posts</h2>
      {postsLoading ? (
        <p>Loading posts...</p>
      ) : (
        <div className="space-y-4">
          {posts?.map((post) => (
            <Card key={post._id}>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar>
                        <AvatarImage src={`https://github.com/${post.author.username}.png`} alt={post.author.username} />
                        <AvatarFallback>{post.author.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{post.author.username}</p>
                        <p className="text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                </CardHeader>
              <CardContent>
                <p>{post.content}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <ThumbsUp size={16} />
                    <span>{post.likeCount}</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Card>
          <CardHeader>
              <CardTitle>Your Reply</CardTitle>
          </CardHeader>
          <CardContent>
              <Textarea placeholder="Write your reply here..." />
          </CardContent>
          <CardFooter>
              <Button>Post Reply</Button>
          </CardFooter>
      </Card>

    </div>
  );
}
