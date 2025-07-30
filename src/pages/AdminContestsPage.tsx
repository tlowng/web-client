// src/pages/AdminContestsPage.tsx
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '@/hooks/use-fetch';
import { getContests, deleteContest, publishContest } from '@/api';
import type { Contest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Trophy, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  RefreshCw,
  Settings,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useBreadcrumbTitle } from '@/contexts/breadcrumb-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminContestsPage() {
  const [deleteContestId, setDeleteContestId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  useBreadcrumbTitle('Contest Management');

  const fetchContests = useCallback(async () => {
    // Get all contests including drafts for admin
    return await getContests({
      status: 'all',
      type: 'all',
      limit: 100 // Get more contests for admin view
    });
  }, []);

  const { data, loading, error, refetch } = useFetch(
    fetchContests,
    null
  );

  const contests = data?.contests || [];

  const handlePublish = async (contestId: string) => {
    setPublishingId(contestId);
    try {
      await publishContest(contestId);
      toast.success('Contest published successfully!');
      refetch();
    } catch (error: any) {
      console.error('Publish error:', error);
      toast.error(error.response?.data?.message || 'Failed to publish contest');
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteContestId) return;

    try {
      await deleteContest(deleteContestId);
      toast.success('Contest deleted successfully!');
      refetch();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete contest');
    } finally {
      setDeleteContestId(null);
    }
  };

  const getStatusBadge = (contest: Contest) => {
    if (!contest.isPublished) {
      return <Badge variant="secondary">Draft</Badge>;
    }
    
    switch (contest.status) {
      case 'upcoming':
        return <Badge variant="outline">Upcoming</Badge>;
      case 'running':
        return <Badge className="bg-green-500">Running</Badge>;
      case 'ended':
        return <Badge variant="secondary">Ended</Badge>;
      default:
        return null;
    }
  };

  const getVisibilityIcon = (contest: Contest) => {
    if (!contest.isPublished) {
      return <EyeOff className="h-4 w-4 text-muted-foreground" />;
    }
    return contest.isVisible ? 
      <Eye className="h-4 w-4 text-green-500" /> : 
      <EyeOff className="h-4 w-4 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-medium mb-2">Error loading contests</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => refetch()}>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Contest Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all contests on the platform
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button asChild>
            <Link to="/admin/contests/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Contest
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Contests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{contests.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {contests.filter(c => !c.isPublished).length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {contests.filter(c => c.status === 'running').length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {contests.reduce((acc, c) => acc + c.participantCount, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contests Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Contests</CardTitle>
          <CardDescription>
            Manage and monitor all contests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead className="text-center">Problems</TableHead>
                  <TableHead className="text-center">Participants</TableHead>
                  <TableHead className="text-center">Visibility</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Trophy className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">No contests created yet</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  contests.map((contest) => (
                    <TableRow key={contest._id}>
                      <TableCell>
                        <Link 
                          to={`/contests/${contest._id}`}
                          className="font-medium hover:underline"
                        >
                          {contest.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {contest.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(contest)}
                      </TableCell>
                      <TableCell>
                        {new Date(contest.startTime).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        {contest.problems.length}
                      </TableCell>
                      <TableCell className="text-center">
                        {contest.participantCount}
                      </TableCell>
                      <TableCell className="text-center">
                        {getVisibilityIcon(contest)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {!contest.isPublished && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePublish(contest._id)}
                              disabled={publishingId === contest._id}
                            >
                              {publishingId === contest._id ? (
                                <>Publishing...</>
                              ) : (
                                <>
                                  <Upload className="h-3 w-3 mr-1" />
                                  Publish
                                </>
                              )}
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <Link to={`/contests/${contest._id}/edit`}>
                              <Edit className="h-3 w-3" />
                            </Link>
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteContestId(contest._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteContestId} onOpenChange={() => setDeleteContestId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contest
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Contest
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}