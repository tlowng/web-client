// src/pages/ForumPage.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFetch } from '@/hooks/use-fetch';
import { getForumCategories, getForumTopics, searchForumTopics } from '@/api';
import type { ForumCategory, ForumTopic } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CreateTopicDialog } from '@/components/create-topic-dialog';
import { ImmediateCreateTopicTest } from '@/components/immediate-create-topic-test';
import { CategoryBugDebug } from '@/components/category-bug-debug';
import { CategoryNavigationTest } from '@/components/category-navigation-test';
import { FrontendCleanupTool } from '@/components/frontend-cleanup-tool';

export default function ForumPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ForumTopic[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Fetch categories
  const fetchCategories = useCallback(() => getForumCategories(), []);
  const { data: categories, loading: categoriesLoading, error: categoriesError } = useFetch<ForumCategory[]>(
    fetchCategories,
    []
  );

  // Fetch initial topics
  const fetchTopics = useCallback(() => getForumTopics({ limit: 10 }), []);
  const { data: topics, loading: topicsLoading, error: topicsError } = useFetch<ForumTopic[]>(
    fetchTopics,
    []
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults(null);
      return;
    }
    
    setSearchLoading(true);
    setSearchError(null);
    try {
      const results = await searchForumTopics(searchTerm);
      setSearchResults(results);
    } catch (error: any) {
      console.error("Failed to search topics", error);
      setSearchError(error.response?.data?.message || error.message || 'Failed to search topics');
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults(null);
  };

  // Use search results if available, otherwise use initial topics
  const displayTopics = searchResults !== null ? searchResults : topics;
  const displayLoading = searchResults !== null ? searchLoading : topicsLoading;
  const displayError = searchResults !== null ? searchError : topicsError;

  return (
    <div className="p-4 space-y-6">
      {/* TEMPORARY DEBUG COMPONENT */}
      <ImmediateCreateTopicTest />
      <CategoryBugDebug />
      <CategoryNavigationTest />
      <FrontendCleanupTool />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Forum</h1>
        <CreateTopicDialog categories={categories || []}>
          <Button>New Topic</Button>
        </CreateTopicDialog>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="search"
          placeholder="Search topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit" disabled={searchLoading}>
          {searchLoading ? 'Searching...' : 'Search'}
        </Button>
        {searchTerm && (
          <Button type="button" variant="outline" onClick={clearSearch}>
            Clear
          </Button>
        )}
      </form>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        {categoriesLoading ? (
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
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">
          {searchResults !== null ? `Search Results for "${searchTerm}"` : 'Recent Topics'}
        </h2>
        <Card>
          <CardContent className="pt-1">
            {displayLoading ? (
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
            ) : displayError ? (
              <div className="text-red-500 text-center py-6">
                <p>Error loading topics: {displayError}</p>
                <Button 
                  variant="outline" 
                  onClick={() => searchResults !== null ? handleSearch(new Event('submit') as any) : window.location.reload()}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            ) : !displayTopics || displayTopics.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">
                  {searchResults !== null ? 'No topics found for your search.' : 'No topics found.'}
                </p>
                {searchResults !== null && (
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
                  {displayTopics.map((topic: ForumTopic) => (
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