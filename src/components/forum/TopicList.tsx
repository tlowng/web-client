// src/components/forum/TopicList.tsx
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { ForumTopic } from '@/types';

interface TopicListProps {
  topics: ForumTopic[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function TopicList({ topics, loading, error, onRetry }: TopicListProps) {
  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="space-y-1 flex-1">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-1/4"></div>
              </div>
              <div className="w-20">
                <div className="h-4 bg-muted animate-pulse rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-6">
        <p>Error loading topics: {error}</p>
        <Button 
          variant="outline" 
          onClick={onRetry}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!topics || topics.length === 0) {
    return (
        <div className="text-center py-6">
            <p className="text-muted-foreground">No topics found.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Topic</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Activity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {topics.map((topic: ForumTopic) => (
          <TableRow key={topic._id}>
            <TableCell>
              <Link to={`/forum/topic/${topic.slug}`} className="font-medium hover:underline">
                {topic.title}
              </Link>
              <div className="text-sm text-muted-foreground">
                by {topic.author.username}
              </div>
              {topic.tags && topic.tags.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {topic.tags.slice(0, 3).map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-muted rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {topic.tags.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{topic.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </TableCell>
            <TableCell>
              {topic.category ? (
                <Link 
                  to={`/forum/${topic.category.slug}`} 
                  className="hover:underline text-sm"
                >
                  {topic.category.name}
                </Link>
              ) : (
                <span className="text-sm text-muted-foreground">No category</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="text-sm">
                {( topic.replyCount || 0)} replies
              </div>
              <div className="text-sm">
                {topic.viewCount} views
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(topic.lastActivity || topic.createdAt).toLocaleDateString()}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
