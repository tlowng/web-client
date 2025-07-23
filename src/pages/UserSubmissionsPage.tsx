// src/pages/UserSubmissionsPage.tsx - FINAL CLEANED VERSION
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '@/hooks/use-fetch';
import { getUserSubmissions } from '@/api';
import type { PopulatedSubmissionResult } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Code, 
  Clock, 
  MemoryStick, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Filter,
  Calendar
} from 'lucide-react';
import { useBreadcrumbTitle } from '@/contexts/breadcrumb-context';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Accepted':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'Wrong Answer':
    case 'Time Limit Exceeded':
    case 'Memory Limit Exceeded':
    case 'Runtime Error':
    case 'Compilation Error':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Accepted':
      return 'default';
    case 'Pending':
    case 'In Queue':
    case 'Judging':
      return 'secondary';
    default:
      return 'destructive';
  }
};

export default function UserSubmissionsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');

  useBreadcrumbTitle('My Submissions');

  const fetchSubmissions = useCallback(async (): Promise<PopulatedSubmissionResult[]> => {
    const filters: any = {};
    
    if (statusFilter !== 'all') {
      filters.status = statusFilter;
    }
    
    if (languageFilter !== 'all') {
      filters.language = languageFilter;
    }
    
    return await getUserSubmissions(filters);
  }, [statusFilter, languageFilter]);

  const { data: submissions, loading, error, refetch } = useFetch<PopulatedSubmissionResult[]>(
    fetchSubmissions,
    [],
    [statusFilter, languageFilter]
  );

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-red-500">
              <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Error loading submissions: {error}</p>
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
            <Code className="h-8 w-8 text-blue-500" />
            My Submissions
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your solution submissions and results
          </p>
        </div>
        
        <Button onClick={() => refetch()} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Wrong Answer">Wrong Answer</SelectItem>
                <SelectItem value="Time Limit Exceeded">Time Limit Exceeded</SelectItem>
                <SelectItem value="Memory Limit Exceeded">Memory Limit Exceeded</SelectItem>
                <SelectItem value="Runtime Error">Runtime Error</SelectItem>
                <SelectItem value="Compilation Error">Compilation Error</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setStatusFilter('all');
                setLanguageFilter('all');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {submissions?.length || 0} Submissions Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-8 w-8" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : submissions?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No submissions found matching your criteria.</p>
              <Button asChild className="mt-4">
                <Link to="/problems">
                  Start Solving Problems
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Problem</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Language</TableHead>
                  <TableHead className="text-center">Runtime</TableHead>
                  <TableHead className="text-center">Memory</TableHead>
                  <TableHead className="text-center">Submitted</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions
                  ?.filter(sub => sub.problemId)
                  .map((submission) => (
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
                      <Badge 
                        variant={getStatusVariant(submission.status)}
                        className="flex items-center gap-1 w-fit mx-auto"
                      >
                        {getStatusIcon(submission.status)}
                        {submission.status}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {submission.language.toUpperCase()}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      {submission.executionTime ? (
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{submission.executionTime}ms</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      {submission.memoryUsed ? (
                        <div className="flex items-center justify-center gap-1">
                          <MemoryStick className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{submission.memoryUsed}MB</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // Could implement view code functionality
                          console.log('View code for submission:', submission._id);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
