import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getUserSubmissions } from '@/api';
import { useFetch } from '@/hooks/use-fetch';
import { Link } from 'react-router-dom';
import { Clock, Code, CheckCircle2, XCircle, AlertCircle, Loader2, Eye } from 'lucide-react';
import type { SubmissionResult } from '@/api';

export default function UserSubmissionsPage() {
  const { data: submissions, loading, error } = useFetch<SubmissionResult[]>(getUserSubmissions, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'Wrong Answer':
      case 'Time Limit Exceeded':
      case 'Runtime Error':
      case 'Compilation Error':
        return <XCircle className="h-4 w-4" />;
      case 'In Queue':
      case 'Judging':
      case 'Pending':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'text-green-600 dark:text-green-400';
      case 'Wrong Answer':
        return 'text-red-600 dark:text-red-400';
      case 'Time Limit Exceeded':
      case 'Runtime Error':
      case 'Compilation Error':
        return 'text-red-600 dark:text-red-400';
      case 'In Queue':
      case 'Judging':
      case 'Pending':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'default';
      case 'Wrong Answer':
      case 'Time Limit Exceeded':
      case 'Runtime Error':
      case 'Compilation Error':
        return 'destructive';
      case 'In Queue':
      case 'Judging':
      case 'Pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (error) {
    return (
      <Card className="mx-auto mt-8 max-w-md">
        <CardContent className="p-6 text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            My Submissions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground mb-4">You haven't made any submissions yet.</p>
          <Button asChild>
            <Link to="/problems">Browse Problems</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className='border-0 p-5 shadow-none'>
        <CardHeader className='p-1'>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              My Submissions
            </CardTitle>
            <Badge variant="secondary" className="text-sm">
              {submissions.length} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Problem</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Language</TableHead>
                  <TableHead className="text-center">
                    <Clock className="h-4 w-4 inline-block" />
                    <span className="ml-1">Time</span>
                  </TableHead>
                  <TableHead className="text-center">Submitted</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission._id} className="hover:bg-muted/50">
                    <TableCell>
                      <Link
                        to={`/problems/${submission.problemId._id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {submission.problemId.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={`flex items-center justify-center gap-1.5 ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        <Badge variant={getStatusVariant(submission.status)} className="text-xs">
                          {submission.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{submission.language}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {submission.executionTime !== undefined ? (
                        <span className="font-medium">{submission.executionTime}ms</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/submissions/${submission._id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}