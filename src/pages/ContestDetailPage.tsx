// src/pages/ContestDetailPage.tsx
import { useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFetch } from '@/hooks/use-fetch';
import { getContestById, registerForContest } from '@/api';
import type { Contest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trophy, 
  Clock, 
  Users, 
  Calendar,
  Lock,
  Code,
  Timer,
  ChevronRight,
  Info,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useBreadcrumbTitle } from '@/contexts/breadcrumb-context';

export default function ContestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [registering, setRegistering] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  useBreadcrumbTitle('Contest Details');

  const fetchContest = useCallback(async (): Promise<Contest> => {
    if (!id) throw new Error('Contest ID is required');
    return await getContestById(id);
  }, [id]);

  const { data: contest, loading, error, refetch } = useFetch<Contest>(
    fetchContest,
    null,
    [id]
  );

  // Update breadcrumb with contest title
  useBreadcrumbTitle(contest?.title || 'Contest Details');

  const handleRegister = async () => {
    if (!contest || !id) return;

    if (contest.type === 'private' && !password) {
      setShowPasswordInput(true);
      return;
    }

    setRegistering(true);
    try {
      await registerForContest({
        contestId: id,
        password: contest.type === 'private' ? password : undefined
      });
      
      toast.success('Successfully registered for the contest!');
      refetch(); // Refresh to update registration status
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Failed to register for contest');
    } finally {
      setRegistering(false);
      setPassword('');
      setShowPasswordInput(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-medium mb-2">Contest not found</p>
            <p className="text-muted-foreground mb-4">{error || 'The contest you are looking for does not exist.'}</p>
            <Button onClick={() => navigate('/contests')}>
              Back to Contests
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isRegistered = contest.isRegistered;
  const canRegister = contest.canRegister && !isRegistered;
  const isCreator = contest.isCreator;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600';
      case 'running': return 'text-green-600';
      case 'ended': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            {contest.title}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="outline" className={getStatusColor(contest.status)}>
              {contest.status.toUpperCase()}
            </Badge>
            {contest.type === 'private' && (
              <Badge variant="outline">
                <Lock className="h-3 w-3 mr-1" />
                Private
              </Badge>
            )}
            {contest.isRated && <Badge variant="destructive">Rated</Badge>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCreator && (
            <Button variant="outline" asChild>
              <Link to={`/contests/${id}/edit`}>
                Edit Contest
              </Link>
            </Button>
          )}
          
          {contest.status === 'running' && isRegistered && (
            <Button asChild>
              <Link to={`/contests/${id}/dashboard`}>
                <Code className="h-4 w-4 mr-2" />
                Enter Contest
              </Link>
            </Button>
          )}
          
          {contest.status !== 'draft' && (
            <Button variant="outline" asChild>
              <Link to={`/contests/${id}/standings`}>
                View Standings
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contest Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {contest.description}
              </div>
            </CardContent>
          </Card>

          {/* Problems */}
          <Card>
            <CardHeader>
              <CardTitle>Problems</CardTitle>
              <CardDescription>
                {contest.problems.length} problems to solve
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {contest.problems.map((problem) => (
                  <div 
                    key={problem.problem._id} 
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        {problem.label}
                      </Badge>
                      <div>
                        <p className="font-medium">
                          {contest.status === 'upcoming' && !isCreator 
                            ? 'Problem ' + problem.label 
                            : problem.problem.title}
                        </p>
                        {contest.status !== 'upcoming' && (
                          <p className="text-sm text-muted-foreground">
                            Difficulty: {problem.problem.difficulty}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{problem.points} points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rules & Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Rules & Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Scoring System</span>
                  <Badge variant="outline">{contest.scoringSystem}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Allowed Languages</span>
                  <div className="flex gap-1 flex-wrap">
                    {contest.allowedLanguages.map(lang => (
                      <Badge key={lang} variant="secondary" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Max Submissions</span>
                  <span className="font-medium">
                    {contest.maxSubmissions === 0 ? 'Unlimited' : contest.maxSubmissions}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Penalty per Wrong Submission</span>
                  <span className="font-medium">{contest.settings.penaltyPerWrongSubmission} points</span>
                </div>
                {contest.freezeTime > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Standings Freeze</span>
                    <span className="font-medium">{contest.freezeTime} min before end</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Contest Details */}
        <div className="space-y-6">
          {/* Time Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Contest Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Start Time</p>
                  <p className="font-medium">
                    {new Date(contest.startTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Time</p>
                  <p className="font-medium">
                    {new Date(contest.endTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{contest.duration} minutes</p>
                </div>
                {contest.status === 'running' && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Time Remaining</p>
                    <p className="font-medium text-green-600 flex items-center gap-1">
                      <Timer className="h-4 w-4" />
                      {Math.floor(contest.timeLeft / (1000 * 60 * 60))}h {' '}
                      {Math.floor((contest.timeLeft % (1000 * 60 * 60)) / (1000 * 60))}m
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Participation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Participants</span>
                  <span className="font-medium">{contest.participantCount}</span>
                </div>
                
                {contest.status === 'upcoming' && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Registration Deadline</p>
                    <p className="font-medium text-sm">
                      {new Date(contest.registrationDeadline).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Registration Section */}
              {canRegister && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  {contest.type === 'private' && showPasswordInput && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Contest Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter contest password"
                        onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                      />
                    </div>
                  )}
                  
                  <Button 
                    className="w-full" 
                    onClick={handleRegister}
                    disabled={registering}
                  >
                    {registering ? 'Registering...' : 'Register for Contest'}
                  </Button>
                </div>
              )}

              {isRegistered && (
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    You are registered for this contest
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Created By */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Created by</p>
              <p className="font-medium">{contest.createdBy?.username || 'Admin'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}