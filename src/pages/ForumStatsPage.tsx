// src/pages/ForumStatsPage.tsx
import { Link } from 'react-router-dom';
import { useFetch } from '@/hooks/use-fetch';
import { getForumStats } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  FileText, 
  Folder,
  TrendingUp,
  Activity,
  Clock,
  Eye,
  Star,
  UserCheck,
  Zap
} from 'lucide-react';
import { useBreadcrumbTitle } from '@/contexts/breadcrumb-context';
import type { ForumTopic } from '@/api';

interface ForumStatsData {
  overview: {
    categories: number;
    topics: number;
    posts: number;
    users: number;
    activeUsers: number;
  };
  trendingTopics: ForumTopic[];
  topContributors: Array<{
    user: {
      username: string;
    };
    reputation: number;
    postCount: number;
    topicCount: number;
  }>;
}

export default function ForumStatsPage() {
  useBreadcrumbTitle('Forum Statistics');

  const { data: stats, loading, error, refetch } = useFetch<ForumStatsData>(
    getForumStats,
    null
  );

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getActivityLevel = (count: number) => {
    if (count >= 100) return { level: 'Very High', color: 'text-red-500', bg: 'bg-red-100' };
    if (count >= 50) return { level: 'High', color: 'text-orange-500', bg: 'bg-orange-100' };
    if (count >= 25) return { level: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-100' };
    if (count >= 10) return { level: 'Low', color: 'text-green-500', bg: 'bg-green-100' };
    return { level: 'Very Low', color: 'text-gray-500', bg: 'bg-gray-100' };
  };

  const calculateEngagementRate = () => {
    if (!stats) return 0;
    const { posts, topics, users } = stats.overview;
    return users > 0 ? ((posts + topics) / users).toFixed(1) : '0';
  };

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-red-500">
              <p>Error loading forum statistics: {error}</p>
              <Button 
                variant="outline" 
                onClick={() => refetch()}
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
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-500" />
            Forum Statistics
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of community activity and engagement
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Updated: {new Date().toLocaleString()}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{formatNumber(stats.overview.users)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">{formatNumber(stats.overview.activeUsers)}</p>
                    <p className="text-xs text-green-600">
                      {((stats.overview.activeUsers / stats.overview.users) * 100).toFixed(1)}% active
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Folder className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="text-2xl font-bold">{stats.overview.categories}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Topics</p>
                    <p className="text-2xl font-bold">{formatNumber(stats.overview.topics)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Posts</p>
                    <p className="text-2xl font-bold">{formatNumber(stats.overview.posts)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Engagement Rate</p>
                    <p className="text-2xl font-bold">{calculateEngagementRate()}</p>
                    <p className="text-xs text-muted-foreground">posts per user</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 rounded-lg">
                    <Activity className="h-6 w-6 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Posts per Topic</p>
                    <p className="text-2xl font-bold">
                      {stats.overview.topics > 0 
                        ? (stats.overview.posts / stats.overview.topics).toFixed(1)
                        : '0'
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">avg discussion length</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Zap className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Activity Level</p>
                    <p className="text-2xl font-bold">
                      {getActivityLevel(stats.overview.activeUsers).level}
                    </p>
                    <div className={`text-xs px-2 py-1 rounded inline-block ${getActivityLevel(stats.overview.activeUsers).bg} ${getActivityLevel(stats.overview.activeUsers).color}`}>
                      {stats.overview.activeUsers} active users
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.trendingTopics.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No trending topics at the moment.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Topic</TableHead>
                        <TableHead className="text-center">Category</TableHead>
                        <TableHead className="text-center">Views</TableHead>
                        <TableHead className="text-center">Replies</TableHead>
                        <TableHead className="text-center">Author</TableHead>
                        <TableHead className="text-center">Activity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.trendingTopics.map((topic, index) => (
                        <TableRow key={topic._id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                #{index + 1}
                              </Badge>
                              <Link 
                                to={`/forum/topic/${topic.slug}`}
                                className="font-medium hover:text-primary transition-colors max-w-xs truncate"
                              >
                                {topic.title}
                              </Link>
                              {topic.isPinned && (
                                <Badge variant="secondary" className="text-xs">
                                  📌 Pinned
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-center">
                            {topic.category ? (
                              <Link 
                                to={`/forum/${topic.category.slug}`}
                                className="text-sm hover:text-primary transition-colors"
                              >
                                {topic.category.name}
                              </Link>
                            ) : (
                              <span className="text-sm text-muted-foreground">No category</span>
                            )}
                          </TableCell>
                          
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              <span>{topic.viewCount}</span>
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-center">
                            <Badge variant="outline">
                              {topic.replyCount || topic.postCount || 0}
                            </Badge>
                          </TableCell>
                          
                          <TableCell className="text-center">
                            <span className="text-sm">{topic.author.username}</span>
                          </TableCell>
                          
                          <TableCell className="text-center">
                            <span className="text-xs text-muted-foreground">
                              {new Date(topic.lastActivity || topic.createdAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Contributors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topContributors.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No contributors data available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.topContributors.slice(0, 6).map((contributor, index) => (
                    <Card key={contributor.user.username} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-12 w-12">
                              <AvatarImage 
                                src={`https://github.com/${contributor.user.username}.png`}
                                alt={contributor.user.username}
                              />
                              <AvatarFallback>
                                {contributor.user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {index < 3 && (
                              <div className="absolute -top-2 -right-2 text-lg">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="font-medium">{contributor.user.username}</div>
                            <div className="text-sm text-muted-foreground">
                              Rank #{index + 1}
                            </div>
                            
                            <div className="flex items-center gap-4 mt-2 text-xs">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span>{contributor.reputation}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3 text-blue-500" />
                                <span>{contributor.postCount}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3 text-green-500" />
                                <span>{contributor.topicCount}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {stats.topContributors.length > 6 && (
                <div className="text-center mt-4">
                  <Button variant="outline" asChild>
                    <Link to="/forum/leaderboard">
                      View Full Leaderboard
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild className="h-16 flex-col gap-2">
                  <Link to="/forum/leaderboard">
                    <Star className="h-5 w-5" />
                    View Leaderboard
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-16 flex-col gap-2">
                  <Link to="/forum">
                    <MessageSquare className="h-5 w-5" />
                    Browse Forum
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-16 flex-col gap-2">
                  <Link to="/members">
                    <Users className="h-5 w-5" />
                    View Members
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No statistics available.</p>
        </div>
      )}
    </div>
  );
}