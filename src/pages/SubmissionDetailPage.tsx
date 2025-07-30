// src/pages/SubmissionDetailPage.tsx - FINALIZED VERSION
import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubmissionById } from '@/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

import type { FullyPopulatedSubmissionResult } from '@/types';

const STATUS_POLLING_INTERVAL = 3000; 

export default function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [submission, setSubmission] = useState<FullyPopulatedSubmissionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Submission ID is missing.');
      setLoading(false);
      return;
    }

    const fetchSubmission = async () => {
      try {
        const response = await getSubmissionById(id);
        setSubmission(response);

        if (!['In Queue', 'Judging', 'Pending'].includes(response.status)) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (err) {
        setError('Failed to fetch submission details.');
        console.error(err);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission(); 
    
    // Only set interval if it's not already running
    if (!intervalRef.current) {
        intervalRef.current = setInterval(fetchSubmission, STATUS_POLLING_INTERVAL);
    }

    // Cleanup function to clear interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [id]);

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
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-500">Error: {error}</p>
        <Button asChild variant="link" className="mt-4">
          <Link to="/submissions/user-submissions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Submissions
          </Link>
        </Button>
      </div>
    );
  }

  if (!submission) {
    return (
        <div className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground">Submission not found.</p>
            <Button asChild variant="link" className="mt-4">
            <Link to="/submissions/user-submissions">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to My Submissions
            </Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submission Details</CardTitle>
          <CardDescription>ID: {submission._id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Status:</span>
            <Badge variant={getStatusVariant(submission.status)}>{submission.status}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Problem:</p>
              <Link to={`/problems/${submission.problemId._id}`} className="text-blue-500 hover:underline">
                {submission.problemId.title}
              </Link>
            </div>
            <div>
              <p className="font-medium">Language:</p>
              <p>{submission.language}</p>
            </div>
            <div>
              <p className="font-medium">User:</p>
              <Link to={`/forum/profile/${submission.userId._id}`} className="text-blue-500 hover:underline">
                {submission.userId.username}
              </Link>
            </div>
            {submission.executionTime !== undefined && (
              <div>
                <p className="font-medium">Execution Time:</p>
                <p>{submission.executionTime} ms</p>
              </div>
            )}
            {submission.memoryUsed !== undefined && (
              <div>
                <p className="font-medium">Memory Used:</p>
                <p>{submission.memoryUsed} KB</p>
              </div>
            )}
            <div>
              <p className="font-medium">Submitted At:</p>
              <p>{new Date(submission.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="font-medium">Last Updated:</p>
              <p>{new Date(submission.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-2">Submitted Code:</h3>
            <pre className="bg-muted text-muted-foreground p-4 rounded-md overflow-x-auto">
              <code>{submission.code}</code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
