// src/pages/ForumLeaderboardPage.tsx
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
import { Trophy, Medal, Award, Star, MessageSquare, FileText, TrendingUp, Users, MapPin, ExternalLink } from 'lucide-react';
import { useBreadcrumbTitle } from '@/contexts/breadcrumb-context';

interface LeaderboardProfile {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
    role: string;
  };
  signature?: string;
  title?: string;
  location?: string;
  website?: string;
  githubProfile?: string;
  postCount: number;
  topicCount: number;
  reputation: number;
  lastSeen: string;
}

interface LeaderboardData {
  profiles: LeaderboardProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function ForumLeaderboardPage() {
  const [sortType, setSortType] = useState<'reputation' | 'posts' | 'topics'>('reputation');
  const [page, setPage] = useState(1);
  const limit = 20;

  useBreadcrumbTitle('Forum Leaderboard');

  const fetchLeaderboard = useCallback(async () => {
    return await getForumLeaderboard({
      type: sortType,
      page,
      limit
    });
  }, [sortType, page, limit]);

  const { data: leaderboardData, loading, error, refetch } = useFetch<LeaderboardData>(
    fetchLeaderboard,
    null,
    [sortType, page]
  );

  const handleSortChange = (newSort: string) => {
    setSortType(newSort as 'reputation' | 'posts' | 'topics');
    setPage(1); // Reset to first page when changing sort
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>;
    }
  };

  const getRankBadgeVariant = (index: number) => {
    switch (index) {
      case 0:
        return 'default'; // Gold
      case 1:
        return 'secondary'; // Silver
      case 2:
        return 'outline'; // Bronze
      default:
        return 'ghost';
    }
  };

  const getUserTitle = (profile: LeaderboardProfile) => {
    if (profile.title) return profile.title;
    
    // Auto-generate title based on reputation
    if (profile.reputation >= 5000) return 'Forum Legend';
    if (profile.reputation >= 2000) return 'Expert Contributor';
    if (profile.reputation >= 1000) return 'Senior Member';
    if (profile.reputation >= 500) return 'Active Member';
    if (profile.reputation >= 100) return 'Regular Member';
    return 'New Member';
  };

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
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
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Sort by:</label>
            <Select value={sortType} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
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
                    Posts
                  </div>
                </SelectItem>
                <SelectItem value="topics">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Topics
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {leaderboardData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold">{leaderboardData.pagination.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Top Reputation</p>
                  <p className="text-2xl font-bold">
                    {leaderboardData.profiles[0]?.reputation || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Most Posts</p>
                  <p className="text-2xl font-bold">
                    {Math.max(...(leaderboardData.profiles.map(p => p.postCount) || [0]))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : !leaderboardData || leaderboardData.profiles.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No members found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead className="text-center">Reputation</TableHead>
                    <TableHead className="text-center">Posts</TableHead>
                    <TableHead className="text-center">Topics</TableHead>
                    <TableHead className="text-center">Last Seen</TableHead>
                    <TableHead className="text-center">Profile</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboardData.profiles.map((profile, index) => {
                    const globalRank = (page - 1) * limit + index;
                    return (
                      <TableRow key={profile._id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {getRankIcon(globalRank)}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage 
                                src={`https://github.com/${profile.user.username}.png`}
                                alt={profile.user.username}
                              />
                              <AvatarFallback>
                                {profile.user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Link 
                                  to={`/forum/profile/${profile.user._id}`}
                                  className="font-medium hover:text-primary transition-colors"
                                >
                                  {profile.user.username}
                                </Link>
                                {globalRank < 3 && (
                                  <Badge variant={getRankBadgeVariant(globalRank)}>
                                    {globalRank === 0 ? '🥇' : globalRank === 1 ? '🥈' : '🥉'}
                                  </Badge>
                                )}
                                {profile.user.role === 'admin' && (
                                  <Badge variant="destructive" className="text-xs">
                                    Admin
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="text-xs text-muted-foreground">
                                {getUserTitle(profile)}
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
                            <span className="font-medium">{profile.reputation}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <Badge variant="outline">{profile.postCount}</Badge>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <Badge variant="outline">{profile.topicCount}</Badge>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <span className="text-sm text-muted-foreground">
                            {formatLastSeen(profile.lastSeen)}
                          </span>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/forum/profile/${profile.user._id}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                            
                            {profile.githubProfile && (
                              <Button variant="ghost" size="sm" asChild>
                                <a 
                                  href={profile.githubProfile} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                                  </svg>
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {leaderboardData && leaderboardData.pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, leaderboardData.pagination.pages) }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
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
            disabled={page >= leaderboardData.pagination.pages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}