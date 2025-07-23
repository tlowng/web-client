// src/pages/ContestStandingsPage.tsx
import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '@/hooks/use-fetch';
import { getContestById, getContestStandings } from '@/api';
import type { Contest, Standings } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trophy, 
  Medal,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Snowflake
} from 'lucide-react';
import { useBreadcrumbTitle } from '@/contexts/breadcrumb-context';

export default function ContestStandingsPage() {
  const { id } = useParams<{ id: string }>();
  const [autoRefresh, setAutoRefresh] = useState(true);

  useBreadcrumbTitle('Contest Standings');

  const fetchContest = useCallback(async (): Promise<Contest> => {
    if (!id) throw new Error('Contest ID is required');
    return await getContestById(id);
  }, [id]);

  const fetchStandings = useCallback(async (): Promise<Standings> => {
    if (!id) throw new Error('Contest ID is required');
    return await getContestStandings(id);
  }, [id]);

  const { data: contest } = useFetch<Contest>(fetchContest, null, [id]);
  const { 
    data: standings, 
    loading, 
    error, 
    refetch 
  } = useFetch<Standings>(fetchStandings, null, [id]);

  // Update breadcrumb with contest title
  useBreadcrumbTitle(contest?.title ? `${contest.title} - Standings` : 'Contest Standings');

  // Auto-refresh standings during contest
  useEffect(() => {
    if (!contest || contest.status !== 'running' || !autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [contest, autoRefresh, refetch]);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-yellow-500"><Trophy className="h-3 w-3 mr-1" />1st</Badge>;
      case 2:
        return <Badge className="bg-gray-400"><Medal className="h-3 w-3 mr-1" />2nd</Badge>;
      case 3:
        return <Badge className="bg-orange-600"><Medal className="h-3 w-3 mr-1" />3rd</Badge>;
      default:
        return <span className="font-mono">{rank}</span>;
    }
  };

  const getProblemCellContent = (status: string, attempts: number, submissionTime?: number) => {
    if (status === 'Not Attempted') {
      return <span className="text-muted-foreground">-</span>;
    }

    const getStatusColor = () => {
      switch (status) {
        case 'AC': return 'text-green-600';
        case 'WA': return 'text-red-600';
        case 'Pending': return 'text-yellow-600';
        default: return '';
      }
    };

    const getStatusIcon = () => {
      switch (status) {
        case 'AC': return <CheckCircle className="h-4 w-4" />;
        case 'WA': return <XCircle className="h-4 w-4" />;
        case 'Pending': return <AlertCircle className="h-4 w-4" />;
        default: return null;
      }
    };

    return (
      <div className={`flex flex-col items-center gap-1 ${getStatusColor()}`}>
        <div className="flex items-center gap-1">
          {getStatusIcon()}
          {status === 'AC' && submissionTime && (
            <span className="text-xs font-medium">{submissionTime}m</span>
          )}
        </div>
        {attempts > 1 && (
          <span className="text-xs">({attempts} tries)</span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !standings || !contest) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Failed to load standings'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const problemLabels = contest.problems.map(p => p.label);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{contest.title} - Standings</h1>
          <p className="text-muted-foreground mt-1">
            Last updated: {new Date(standings.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {contest.status === 'running' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Disable' : 'Enable'} Auto-refresh
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" asChild>
            <Link to={`/contests/${id}`}>
              Back to Contest
            </Link>
          </Button>
        </div>
      </div>

      {/* Standings Info */}
      {standings.isFrozen && (
        <Alert>
          <Snowflake className="h-4 w-4" />
          <AlertDescription>
            Standings are frozen. Final results will be revealed after the contest ends.
          </AlertDescription>
        </Alert>
      )}

      {/* Standings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">Rank</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center">Penalty</TableHead>
                  {problemLabels.map(label => (
                    <TableHead key={label} className="text-center min-w-20">
                      <Badge variant="outline" className="font-mono">
                        {label}
                      </Badge>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings.rankings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4 + problemLabels.length} className="text-center py-8">
                      <Trophy className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">No submissions yet</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  standings.rankings.map((entry) => (
                    <TableRow key={entry.user._id}>
                      <TableCell className="text-center font-medium">
                        {getRankBadge(entry.rank)}
                      </TableCell>
                      <TableCell>
                        <Link 
                          to={`/forum/profile/${entry.user._id}`}
                          className="hover:underline font-medium"
                        >
                          {entry.user.username}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {entry.totalScore}
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.totalPenalty}
                      </TableCell>
                      {problemLabels.map(label => {
                        const problem = entry.problems.find(p => p.label === label);
                        return (
                          <TableCell key={label} className="text-center">
                            {problem ? getProblemCellContent(
                              problem.status, 
                              problem.attempts,
                              problem.submissionTime
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Accepted</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span>Wrong Answer</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">-</span>
              <span>Not Attempted</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}