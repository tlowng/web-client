// src/pages/ContestDetailPage.tsx
import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '@/hooks/use-fetch';
import { getContestById, registerForContest, getMe } from '@/api';
import type { Contest, UserProfile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Trophy, 
  Users, 
  Info,
  List,
  BarChart,
  LogIn,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { useBreadcrumbTitle } from '@/contexts/breadcrumb-context';
import { getDifficultyVariant } from '@/utils/ui-helpers';

export default function ContestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [password, setPassword] = useState('');
  const [registering, setRegistering] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    getMe().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  const fetchContest = useCallback(async (): Promise<Contest> => {
    if (!id) throw new Error('Contest ID is required');
    return await getContestById(id);
  }, [id]);

  const { data: contest, loading, error, refetch } = useFetch<Contest>(
    fetchContest,
    null,
    [id]
  );

  useBreadcrumbTitle(contest?.title || 'Contest Details');

  const handleRegister = async () => {
    if (!id) return;
    setRegistering(true);
    try {
      await registerForContest({ contestId: id, password });
      toast.success('Successfully registered for the contest!');
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };
  
  const isCreator = currentUser && contest && contest.createdBy?._id === currentUser._id;
  const isRegistered = currentUser && contest && contest.participants?.some(p => p.user?._id === currentUser._id);

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Contest not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const renderActionButtons = () => {
    if (contest.status === 'running') {
      if (isRegistered || isCreator) {
        return (
          <Button asChild className="w-full">
            <Link to={`/contests/${id}/dashboard`}>
              <LogIn className="h-4 w-4 mr-2" />
              Enter Contest
            </Link>
          </Button>
        );
      }
      return <p className="text-sm text-muted-foreground text-center">You are not registered for this contest.</p>;
    }

    if (contest.canRegister && contest.status === 'upcoming') {
      if (isRegistered) {
        return <p className="text-sm text-green-600 text-center">You are registered for this contest.</p>;
      }
      if (contest.type === 'private') {
        return (
          <div className="space-y-2">
            <Input 
              type="password" 
              placeholder="Contest Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={registering}
            />
            <Button onClick={handleRegister} disabled={registering} className="w-full">
              {registering ? 'Registering...' : 'Register'}
            </Button>
          </div>
        );
      }
      return (
        <Button onClick={handleRegister} disabled={registering} className="w-full">
           <UserPlus className="h-4 w-4 mr-2" />
          {registering ? 'Registering...' : 'Register Now'}
        </Button>
      );
    }

    if (contest.status === 'ended') {
       return (
          <Button asChild className="w-full" variant="secondary">
            <Link to={`/contests/${id}/standings`}>
              <BarChart className="h-4 w-4 mr-2" />
              View Final Standings
            </Link>
          </Button>
        );
    }
    
    return <p className="text-sm text-muted-foreground text-center">Registration is not open yet.</p>;
  };
  
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold">{contest.title}</h1>
        <p className="text-muted-foreground mt-1">{contest.description}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Problems
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contest.problems?.map(({ problem, label, points }) => (
                    <TableRow key={problem?._id}>
                      <TableCell>{label}</TableCell>
                      <TableCell>
                         <Link to={`/problems/${problem?._id}`} className="hover:underline text-blue-500">
                          {problem?.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getDifficultyVariant(problem?.difficulty)}>
                          {problem?.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>{points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderActionButtons()}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Contest Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <strong>Status:</strong> 
                <Badge>{contest.status}</Badge>
              </div>
              <div className="flex justify-between">
                <strong>Type:</strong>
                <span>{contest.type}</span>
              </div>
              <div className="flex justify-between">
                <strong>Starts:</strong>
                <span>{new Date(contest.startTime).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <strong>Ends:</strong>
                <span>{new Date(contest.endTime).toLocaleString()}</span>
              </div>
               <div className="flex justify-between">
                <strong>Duration:</strong>
                <span>{contest.duration} minutes</span>
              </div>
              <div className="flex justify-between">
                <strong>Participants:</strong>
                <span>{contest.participantCount}</span>
              </div>
              <div className="flex justify-between">
                <strong>Created By:</strong>
                <span>{contest.createdBy?.username || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contest.participants?.length > 0 ? (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {contest.participants.map(p => (
                    <li key={p.user?._id}>
                      <Link to={`/forum/users/${p.user?._id}`} className="text-sm hover:underline">
                        {p.user?.username || 'Unknown User'}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No participants yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
