// src/pages/ForumCategoryPage.tsx
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '@/hooks/use-fetch';
import { getForumTopics, getCategoryBySlug, ForumTopic, ForumCategory } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export default function ForumCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category, loading: categoryLoading } = useFetch(() => getCategoryBySlug(slug!));
  const { data: topics, loading: topicsLoading } = useFetch(() => getForumTopics({ category: slug }));

  return (
    <div className="p-4 space-y-6">
      {categoryLoading ? (
        <p>Loading category...</p>
      ) : category ? (
        <header className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <span style={{ color: category.color }}>{category.icon}</span>
                {category.name}
            </h1>
            <p className="text-muted-foreground">{category.description}</p>
        </header>
      ) : (
        <p>Category not found.</p>
      )}

      <div className="flex justify-end">
        <Button>New Topic</Button>
      </div>

      <Card>
        <CardContent>
          {topicsLoading ? (
            <p>Loading topics...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                  <TableHead className="text-right">Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics?.map((topic: ForumTopic) => (
                  <TableRow key={topic._id}>
                    <TableCell>
                      <Link to={`/forum/topic/${topic.slug}`} className="font-medium hover:underline">
                        {topic.title}
                      </Link>
                      <div className="text-sm text-muted-foreground">
                        by {topic.author.username}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>{topic.postCount} posts</div>
                      <div className="text-sm text-muted-foreground">{new Date(topic.createdAt).toLocaleDateString()}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
