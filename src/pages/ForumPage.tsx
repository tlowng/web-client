// src/pages/ForumPage.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFetch } from '@/hooks/use-fetch';
import { getForumCategories, getForumTopics, searchForumTopics } from '@/api';
import type { ForumCategory, ForumTopic } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

export default function ForumPage() {
  // Fixed: Use stable function reference to prevent infinite re-renders
  const fetchCategories = useCallback(async () => {
    const response = await getForumCategories();
    return response;
  }, []);

  const { data: categories, loading: categoriesLoading, error: categoriesError } = useFetch<ForumCategory[]>(
    fetchCategories,
    [],
    [] // Empty dependencies array since this should only run once
  );

  console.log("categories from useFetch:", categories);

  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInitialTopics = async () => {
    setTopicsLoading(true);
    setTopicsError(null);
    try {
      const response = await getForumTopics({ limit: 10 });
      console.log("Initial topics response:", response);
      setTopics(response.data || []);
    } catch (error: any) {
      console.error("Failed to fetch topics", error);
      setTopicsError(error.response?.data?.message || error.message || 'Failed to fetch topics');
    } finally {
      setTopicsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialTopics();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchInitialTopics();
      return;
    }
    
    setTopicsLoading(true);
    setTopicsError(null);
    try {
      const response = await searchForumTopics(searchTerm);
      console.log("Search topics response:", response);
      setTopics(response.data || []);
    } catch (error: any) {
      console.error("Failed to search topics", error);
      setTopicsError(error.response?.data?.message || error.message || 'Failed to search topics');
    } finally {
      setTopicsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    fetchInitialTopics();
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Forum</h1>
        <Button>New Topic</Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="search"
          placeholder="Search topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit">Search</Button>
        {searchTerm && (
          <Button type="button" variant="outline" onClick={clearSearch}>
            Clear
          </Button>
        )}
      </form>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        {categoriesLoading ? (
          <p>Loading categories...</p>
        ) : categoriesError ? (
          <div className="text-red-500">
            <p>Error loading categories: {categoriesError}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        ) : !categories || categories.length === 0 ? (
          <p className="text-muted-foreground">No categories found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category: ForumCategory) => (
              <Link to={`/forum/${category.slug}`} key={category._id}>
                <Card className="hover:shadow-lg transition-shadow">
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
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">
          {searchTerm ? `Search Results for "${searchTerm}"` : 'Recent Topics'}
        </h2>
        <Card>
          <CardContent>
            {topicsLoading ? (
              <p>Loading topics...</p>
            ) : topicsError ? (
              <div className="text-red-500 text-center py-4">
                <p>Error loading topics: {topicsError}</p>
                <Button 
                  variant="outline" 
                  onClick={fetchInitialTopics}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            ) : !topics || topics.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  {searchTerm ? 'No topics found for your search.' : 'No topics found.'}
                </p>
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    onClick={clearSearch}
                    className="mt-2"
                  >
                    View All Topics
                  </Button>
                )}
              </div>
            ) : (
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
                          {(topic.postCount || topic.replyCount || 0)} replies
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
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}