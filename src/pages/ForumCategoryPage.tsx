import { useParams, Link } from 'react-router-dom';
import { useFetch } from '@/hooks/use-fetch';
import { getForumTopics, getCategoryBySlug, getForumCategories } from '@/api';
import type { ForumTopic, ForumCategory } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBreadcrumbTitle } from '@/contexts/breadcrumb-context';
import { useCallback } from 'react';
import { CreateTopicDialog } from '@/components/create-topic-dialog';
import { TopicList } from '@/components/forum/TopicList';

export default function ForumCategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  // Fixed: Use stable function references to prevent infinite re-renders
  const fetchCategory = useCallback(async () => {
    if (!slug) throw new Error('Category slug is required');
    return await getCategoryBySlug(slug);
  }, [slug]);

  const fetchTopics = useCallback(async () => {
    if (!slug) throw new Error('Category slug is required');
    return await getForumTopics({ category: slug });
  }, [slug]);

  const fetchCategories = useCallback(async () => {
    return await getForumCategories();
  }, []);

  const { data: category, loading: categoryLoading, error: categoryError, refetch: refetchCategory } = useFetch<ForumCategory>(
    fetchCategory,
    null,
    [slug]
  );

  const { data: topics, loading: topicsLoading, error: topicsError, refetch: refetchTopics } = useFetch<ForumTopic[]>(
    fetchTopics,
    [],
    [slug]
  );

  const { data: allCategories } = useFetch<ForumCategory[]>(
    fetchCategories,
    []
  );

  // Set breadcrumb title when category is loaded
  useBreadcrumbTitle(category?.name || 'Category');

  const handleRetry = () => {
      if (categoryError) refetchCategory();
      if (topicsError) refetchTopics();
  }

  if (categoryError) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-red-500">
              <p>Error loading page:</p>
              <p>{categoryError}</p>
              <Button 
                variant="outline" 
                onClick={handleRetry}
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
      {categoryLoading ? (
        <div className="space-y-2">
          <div className="h-8 bg-muted animate-pulse rounded"></div>
          <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
        </div>
      ) : category ? (
        <header className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <span style={{ color: category.color }}>{category.icon}</span>
            {category.name}
          </h1>
          <p className="text-muted-foreground">{category.description}</p>
          {category.topicCount !== undefined && (
            <div className="text-sm text-muted-foreground">
              {category.topicCount} topics • {category.postCount || 0} posts
            </div>
          )}
        </header>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Category not found.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/">Back to Forum</Link>
          </Button>
        </div>
      )}

      <div className="flex justify-end">
        <CreateTopicDialog categories={allCategories || []} defaultCategoryId={category?._id}>
          <Button>New Topic</Button>
        </CreateTopicDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Topics</CardTitle>
        </CardHeader>
        <CardContent>
            <TopicList 
                topics={topics || []}
                loading={topicsLoading}
                error={topicsError}
                onRetry={refetchTopics}
            />
          {!topicsLoading && (!topics || topics.length === 0) && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No topics found in this category.</p>
              <CreateTopicDialog categories={allCategories || []} defaultCategoryId={category?._id}>
                <Button className="mt-4">Create First Topic</Button>
              </CreateTopicDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}