// src/pages/ContestsPage.tsx
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '@/hooks/use-fetch';
import { getContests } from '@/api';
import type { Contest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Trophy, 
  Clock, 
  Users, 
  Calendar, 
  Lock, 
  Unlock,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useBreadcrumbTitle } from '@/contexts/breadcrumb-context';

const getContestStatusBadge = (contest: Contest) => {
  switch (contest.status) {
    case 'upcoming':
      return <Badge variant="secondary">Upcoming</Badge>;
    case 'running':
      return <Badge variant="default" className="bg-green-500">Running</Badge>;
    case 'ended':
      return <Badge variant="outline">Ended</Badge>;
    default:
      return <Badge variant="outline">Draft</Badge>;
  }
};

const getContestTypeBadge = (type: string) => {
  switch (type) {
    case 'public':
      return <Badge variant="outline" className="gap-1"><Unlock className="h-3 w-3" />Public</Badge>;
    case 'private':
      return <Badge variant="outline" className="gap-1"><Lock className="h-3 w-3" />Private</Badge>;
    case 'rated':
      return <Badge variant="default">Rated</Badge>;
    default:
      return null;
  }
};

const formatTimeLeft = (milliseconds: number) => {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} left`;
  }
  
  return `${hours}h ${minutes}m left`;
};

export default function ContestsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  useBreadcrumbTitle('Contests');

  const fetchContests = useCallback(async () => {
    return await getContests({
      status: statusFilter as any,
      type: typeFilter as any,
      page,
      limit
    });
  }, [statusFilter, typeFilter, page]);

  const { data, loading, error, refetch } = useFetch(
    fetchContests,
    null,
    [statusFilter, typeFilter, page]
  );

  const contests = data?.contests || [];
  const pagination = data?.pagination;

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-500">Error loading contests: {error}</p>
            <Button onClick={() => refetch()} className="mt-4">
              Retry
            </Button>
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
            Contests
          </h1>
          <p className="text-muted-foreground mt-1">
            Participate in programming competitions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          
          {/* Admin: Create Contest Button */}
          <Button asChild>
            <Link to="/admin/contests/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Contest
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                  <SelectItem value="registering">Open for Registration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="rated">Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contest List */}
      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : contests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No contests found</p>
            <p className="text-muted-foreground">
              Check back later for upcoming competitions!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contests.map((contest) => (
            <Card key={contest._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">
                      <Link 
                        to={`/contests/${contest._id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {contest.title}
                      </Link>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {contest.description}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getContestStatusBadge(contest)}
                    {getContestTypeBadge(contest.type)}
                    {contest.isRated && <Badge variant="destructive">Rated</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(contest.startTime).toLocaleDateString()} {' '}
                      {new Date(contest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Duration: {contest.duration} minutes</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{contest.participantCount} participants</span>
                  </div>
                  
                  {contest.status === 'running' && (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <Clock className="h-4 w-4" />
                      <span>{formatTimeLeft(contest.timeLeft)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Created by {contest.createdBy?.username || 'Admin'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {contest.canRegister && contest.status === 'upcoming' && (
                      <Button size="sm" asChild>
                        <Link to={`/contests/${contest._id}`}>
                          Register
                        </Link>
                      </Button>
                    )}
                    
                    {contest.status === 'running' && (
                      <Button size="sm" variant="default" asChild>
                        <Link to={`/contests/${contest._id}/dashboard`}>
                          Enter Contest
                        </Link>
                      </Button>
                    )}
                    
                    {contest.status === 'ended' && (
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/contests/${contest._id}/standings`}>
                          View Results
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}