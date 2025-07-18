import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFetch } from '@/hooks/use-fetch';
import { getForumCategories, getForumTopics, searchForumTopics } from '@/api';
import type { ForumCategory, ForumTopic } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ForumPage() {
const { data: categories, loading: categoriesLoading } = useFetch(() => getForumCategories());
  console.log("categories", categories); // Thêm dòng này

  const [topics, setTopics] = useState<ForumTopic[] | null>(null);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInitialTopics = async () => {
    setTopicsLoading(true);
    try {
      const response = await getForumTopics({ limit: 10 });
      setTopics(response.data);
    } catch (error) {
      console.error("Failed to fetch topics", error);
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
    try {
      const response = await searchForumTopics(searchTerm);
      setTopics(response.data);
    } catch (error) {
      console.error("Failed to search topics", error);
    } finally {
      setTopicsLoading(false);
    }
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
      </form>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        {categoriesLoading ? (
          <p>Loading categories...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories?.map((category: ForumCategory) => (
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
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">{searchTerm ? `Search Results for "${searchTerm}"` : 'Recent Topics'}</h2>
        <Card>
          <CardContent>
            {topicsLoading ? (
              <p>Loading topics...</p>
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
                      <TableCell>
                        <Link to={`/forum/${topic.category.slug}`} className="hover:underline">
                            {topic.category.name}
                        </Link>
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
      </section>
    </div>
  );
}
