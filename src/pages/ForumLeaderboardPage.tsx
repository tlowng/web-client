// src/pages/ForumLeaderboardPage.tsx - FIXED VERSION
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '@/hooks/use-fetch';
import { getForumLeaderboard } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Star, MessageSquare, FileText, TrendingUp, Users, MapPin, ExternalLink } from 'lucide-react';
import { useBreadcrumbTitle } from '@/contexts/breadcrumb-context';
import type { LeaderboardResponse } from '@/types';
import { getRankIcon, formatLastSeen } from '@/utils/ui-helpers.tsx';

export default function ForumLeaderboardPage() {
  const [sortType, setSortType] = useState<'reputation' | 'posts' | 'topics'>('reputation');
  const [page, setPage] = useState(1);
  const limit = 20;

  useBreadcrumbTitle('Forum Leaderboard');

  const fetchLeaderboard = useCallback(async (): Promise<LeaderboardResponse> => {
    return await getForumLeaderboard({
      type: sortType,
      page,
      limit
    });
  }, [sortType, page, limit]);

  const { data: leaderboardData, loading, error, refetch } = useFetch<LeaderboardResponse>(
    fetchLeaderboard,
    null,
    [sortType, page]
  );

  const handleSortChange = (newSort: string) => {
    setSortType(newSort as 'reputation' | 'posts' | 'topics');
    setPage(1); // Reset to first page when changing sort
  };

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-red-500">
              <p>Error loading leaderboard: {error}</p>
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
            <Trophy className="h-8 w-8 text-yellow-500" />
            Forum Leaderboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Top contributors in our community
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={sortType} onValueChange={handleSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reputation">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Reputation
                </div>
              </SelectItem>
              <SelectItem value="posts">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Post Count
                </div>
              </SelectItem>
              <SelectItem value="topics">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Topic Count
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => refetch()}
            disabled={loading}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">
                  {leaderboardData?.pagination.total || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">
                  {leaderboardData?.profiles.reduce((sum, profile) => sum + profile.postCount, 0) || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Top Reputation</p>
                <p className="text-2xl font-bold">
                  {leaderboardData?.profiles[0]?.reputation || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Community Leaders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : leaderboardData?.profiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-center">Reputation</TableHead>
                  <TableHead className="text-center">Posts</TableHead>
                  <TableHead className="text-center">Topics</TableHead>
                  <TableHead className="text-center">Last Seen</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData?.profiles.map((profile, index) => {
                  const rank = (leaderboardData.pagination.page - 1) * leaderboardData.pagination.limit + index + 1;
                  
                  return (
                    <TableRow key={profile._id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getRankIcon(rank)}
                          <span className={rank <= 3 ? 'font-bold' : ''}>{rank}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={profile.avatar} alt={profile.user.username} />
                            <AvatarFallback>
                              {profile.user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link 
                              to={`/forum/users/${profile.user._id}`}
                              className="font-medium hover:underline"
                            >
                              {profile.user.username}
                            </Link>
                            {profile.title && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {profile.title}
                              </Badge>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {profile.title || (profile.reputation >= 1000 ? 'Senior Member' : 'Member')}
                            </div>
                            {profile.location && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {profile.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold">{profile.reputation}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          <span>{profile.postCount}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <FileText className="h-4 w-4 text-green-500" />
                          <span>{profile.topicCount}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {formatLastSeen(profile.lastSeen)}
                      </TableCell>
                      
                      <TableCell>
                        <Link to={`/forum/users/${profile.user._id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {leaderboardData && leaderboardData.pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, leaderboardData.pagination.pages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            disabled={page === leaderboardData.pagination.pages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}