// src/components/forum/CategoryList.tsx
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ForumCategory } from '@/types';

interface CategoryListProps {
  categories: ForumCategory[];
  loading: boolean;
  error: string | null;
}

export function CategoryList({ categories, loading, error }: CategoryListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted animate-pulse rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        <p>Error loading categories: {error}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return <p className="text-muted-foreground">No categories found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category: ForumCategory) => (
        <Link to={`/forum/${category.slug}`} key={category._id}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span style={{ color: category.color }}>{category.icon}</span>
                {category.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{category.description}</p>
              {category.topicCount !== undefined && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {category.topicCount} topics • {category.postCount || 0} posts
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
