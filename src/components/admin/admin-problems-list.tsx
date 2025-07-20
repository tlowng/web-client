// src/components/admin/admin-problems-list.tsx
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  TestTube, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Clock,
  MemoryStick,
  Filter,
  Plus,
  RefreshCw
} from 'lucide-react';
import { useFetch } from '@/hooks/use-fetch';
import { getProblems, deleteProblem } from '@/api';
import { CreateProblemDialog } from './create-problem-dialog';
import { toast } from 'sonner';
import type { ProblemData } from '@/api';

export function AdminProblemsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchProblems = useCallback(async () => {
    const filters: any = {};
    
    if (difficultyFilter !== 'all') {
      filters.difficulty = difficultyFilter;
    }
    
    if (searchTerm.trim()) {
      filters.search = searchTerm.trim();
    }
    
    return await getProblems(filters);
  }, [searchTerm, difficultyFilter]);

  const { 
    data: problems, 
    loading, 
    error, 
    refetch 
  } = useFetch<ProblemData[]>(fetchProblems, [], [searchTerm, difficultyFilter]);

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'hard':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleDeleteProblem = async (problemId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(problemId);
    try {
      await deleteProblem(problemId);
      toast.success('Problem deleted successfully');
      await refetch(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to delete problem:', error);
      toast.error(error.message || 'Failed to delete problem');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleProblemCreated = async () => {
    toast.success('Problem created successfully!');
    await refetch(); // Refresh the list
  };

  const filteredProblems = problems?.filter(problem => {
    if (!searchTerm.trim()) return true;
    return problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           problem.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Problems Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Create and manage coding problems
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <CreateProblemDialog onProblemCreated={handleProblemCreated}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Problem
                </Button>
              </CreateProblemDialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search problems..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problems List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Problems ({filteredProblems?.length || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500">
                <p>Error loading problems: {error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => refetch()}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : !filteredProblems || filteredProblems.length === 0 ? (
            <div className="text-center py-8">
              <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm || difficultyFilter !== 'all' 
                  ? 'No problems found matching your filters'
                  : 'No problems created yet'
                }
              </p>
              {(!searchTerm && difficultyFilter === 'all') && (
                <CreateProblemDialog onProblemCreated={handleProblemCreated}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Problem
                  </Button>
                </CreateProblemDialog>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-center">Difficulty</TableHead>
                    <TableHead className="text-center">Limits</TableHead>
                    <TableHead className="text-center">Test Cases</TableHead>
                    <TableHead className="text-center">Created</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProblems.map((problem) => (
                    <TableRow key={problem._id}>
                      <TableCell>
                        <div>
                          <Link 
                            to={`/problems/${problem._id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {problem.title}
                          </Link>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-sm text-muted-foreground mt-1 cursor-help">
                                  {problem.description.length > 100 
                                    ? `${problem.description.substring(0, 100)}...` 
                                    : problem.description
                                  }
                                </p>
                              </TooltipTrigger>
                              {problem.description.length > 100 && (
                                <TooltipContent className="max-w-md">
                                  <p className="whitespace-pre-wrap">{problem.description}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <Badge 
                          variant={getDifficultyVariant(problem.difficulty)}
                          className={getDifficultyColor(problem.difficulty)}
                        >
                          {problem.difficulty}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="space-y-1 cursor-help">
                                <div className="flex items-center justify-center gap-1 text-xs">
                                  <Clock className="h-3 w-3" />
                                  <span>{problem.timeLimit}ms</span>
                                </div>
                                <div className="flex items-center justify-center gap-1 text-xs">
                                  <MemoryStick className="h-3 w-3" />
                                  <span>{problem.memoryLimit}MB</span>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-sm">
                                <p><strong>Time Limit:</strong> {problem.timeLimit} milliseconds</p>
                                <p><strong>Memory Limit:</strong> {problem.memoryLimit} megabytes</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-help">
                                <Badge variant="outline">
                                  {problem.testCases?.length || 0} cases
                                </Badge>
                              </div>
                            </TooltipTrigger>
                            {problem.testCases && problem.testCases.length > 0 && (
                              <TooltipContent className="max-w-sm">
                                <div className="text-sm space-y-2">
                                  <p><strong>Test Cases:</strong></p>
                                  {problem.testCases.slice(0, 2).map((testCase, index) => (
                                    <div key={index} className="border-l-2 border-muted pl-2">
                                      <p><strong>Case {index + 1}:</strong></p>
                                      <p><strong>Input:</strong> {testCase.input.length > 30 ? `${testCase.input.substring(0, 30)}...` : testCase.input}</p>
                                      <p><strong>Output:</strong> {testCase.output.length > 30 ? `${testCase.output.substring(0, 30)}...` : testCase.output}</p>
                                    </div>
                                  ))}
                                  {problem.testCases.length > 2 && (
                                    <p className="text-muted-foreground">...and {problem.testCases.length - 2} more</p>
                                  )}
                                </div>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <span className="text-sm text-muted-foreground">
                          {problem.createdAt 
                            ? new Date(problem.createdAt).toLocaleDateString()
                            : 'Unknown'
                          }
                        </span>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                >
                                  <Link to={`/problems/${problem._id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View problem details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    // TODO: Implement edit functionality
                                    toast.info('Edit functionality coming soon');
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit problem (coming soon)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteProblem(problem._id!, problem.title)}
                                  disabled={deleteLoading === problem._id}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  {deleteLoading === problem._id ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{deleteLoading === problem._id ? 'Deleting...' : 'Delete problem'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {filteredProblems && filteredProblems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredProblems.length}
                </div>
                <div className="text-sm text-blue-600/80">Total Problems</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {filteredProblems.filter(p => p.difficulty === 'easy').length}
                </div>
                <div className="text-sm text-green-600/80">Easy</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredProblems.filter(p => p.difficulty === 'medium').length}
                </div>
                <div className="text-sm text-yellow-600/80">Medium</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {filteredProblems.filter(p => p.difficulty === 'hard').length}
                </div>
                <div className="text-sm text-red-600/80">Hard</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}