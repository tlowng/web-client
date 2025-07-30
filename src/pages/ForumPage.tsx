import { Card, CardContent } from '@/components/ui/card';
import { useFetch } from '@/hooks/use-fetch';
import { getForumCategories, getForumTopics, searchForumTopics } from '@/api';
import type { ForumCategory, ForumTopic } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CreateTopicDialog } from '@/components/create-topic-dialog';
import { Trophy, BarChart3 } from 'lucide-react';
import { CategoryList } from '@/components/forum/CategoryList';
import { TopicList } from '@/components/forum/TopicList';

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
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Newsfeed</h1>
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
        <div className="flex gap-2 mb-5">
          <Button asChild variant="outline" size="sm">
            <Link to="/forum/leaderboard">
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="sm">
            <Link to="/forum/stats">
              <BarChart3 className="h-4 w-4 mr-2" />
              Stats
            </Link>
          </Button>
        </div>
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        <CategoryList categories={categories || []} loading={categoriesLoading} error={categoriesError} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">
          {searchResults !== null ? `Search Results for "${searchTerm}"` : 'Recent Topics'}
        </h2>
        <Card>
          <CardContent className="pt-1">
            <TopicList 
              topics={displayTopics || []} 
              loading={displayLoading} 
              error={displayError} 
              onRetry={() => searchResults !== null ? handleSearch(new Event('submit') as any) : window.location.reload()} 
            />
             {searchResults !== null && (!displayTopics || displayTopics.length === 0) && (
                <div className="text-center pb-6">
                    <p className="text-muted-foreground">No topics found for your search.</p>
                    <Button 
                        variant="outline" 
                        onClick={clearSearch}
                        className="mt-2"
                    >
                        View All Topics
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}