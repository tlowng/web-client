// src/pages/ForumStatsPage.tsx - FIXED VERSION  
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
import type { ForumTopic } from '@/types';
import { formatNumber, getActivityLevel, calculateEngagementRate } from '@/utils/ui-helpers';

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

      {/* Content */}
      {loading ? (
        <div className="space-y-6">
          {/* Loading skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : stats ? (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Folder className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="text-2xl font-bold">{formatNumber(stats.overview.categories)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Topics</p>
                    <p className="text-2xl font-bold">{formatNumber(stats.overview.topics)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Posts</p>
                    <p className="text-2xl font-bold">{formatNumber(stats.overview.posts)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{formatNumber(stats.overview.users)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">{formatNumber(stats.overview.activeUsers)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Engagement Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {calculateEngagementRate(stats)}
                </div>
                <p className="text-sm text-muted-foreground">Posts + Topics per user</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getActivityLevel(stats.overview.posts + stats.overview.topics).bg} ${getActivityLevel(stats.overview.posts + stats.overview.topics).color}`}>
                    {getActivityLevel(stats.overview.posts + stats.overview.topics).level}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Based on total content</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Community Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.overview.users > 0 ? Math.round((stats.overview.activeUsers / stats.overview.users) * 100) : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Active user ratio</p>
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
                              {topic.replyCount || 0}
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
                    <Card key={index} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://github.com/${contributor.user.username}.png`} />
                            <AvatarFallback>
                              {contributor.user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{contributor.user.username}</h4>
                              <Badge variant="outline" className="text-xs">
                                #{index + 1}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
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