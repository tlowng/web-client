// src/pages/ProblemsPage.tsx - FINAL CLEANED VERSION
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '@/hooks/use-fetch';
import { getProblems } from '@/api';
import type { ProblemData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, BookOpen, Clock, MemoryStick, Filter, RefreshCw } from 'lucide-react';
import { getDifficultyVariant, getDifficultyColor } from '@/utils/ui-helpers';
import { useBreadcrumbTitle } from '@/contexts/breadcrumb-context';

export default function ProblemsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useBreadcrumbTitle('Problems');

  const fetchProblems = useCallback(async (): Promise<ProblemData[]> => {
    const filters: any = {};
    
    if (selectedDifficulty !== 'all') {
      filters.difficulty = selectedDifficulty;
    }
    
    if (selectedTags.length > 0) {
      filters.tags = selectedTags;
    }
    
    if (searchTerm.trim()) {
      filters.search = searchTerm.trim();
    }
    
    return await getProblems(filters);
  }, [searchTerm, selectedDifficulty, selectedTags]);

  const { data: problems, loading, error, refetch } = useFetch<ProblemData[]>(
    fetchProblems,
    [],
    [searchTerm, selectedDifficulty, selectedTags]
  );

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-blue-500" />
            Problems
          </h1>
          <p className="text-muted-foreground mt-1">
            Practice competitive programming problems
          </p>
        </div>
        
        <Button onClick={() => refetch()} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-2 pb-2 pl-4 pr-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedDifficulty('all');
                setSelectedTags([]);
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Problems List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {problems?.length || 0} Problems Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-12 w-12" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading problems: {error}</p>
              <Button 
                variant="outline" 
                onClick={() => refetch()}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : problems?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No problems found matching your criteria.</p>
            </div>
          ) : (
            <Table>{/* No extra whitespace */}
              <TableHeader>
                <TableRow>
                  <TableHead>Problem</TableHead>
                  <TableHead className="text-center">Difficulty</TableHead>
                  <TableHead className="text-center">Time Limit</TableHead>
                  <TableHead className="text-center">Memory Limit</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {problems?.map((problem) => (
                  <TableRow key={problem._id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <Link 
                          to={`/problems/${problem._id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {problem.title}
                        </Link>
                        {problem.tags && problem.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {problem.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {problem.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{problem.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
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
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{problem.timeLimit}ms</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <MemoryStick className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{problem.memoryLimit}MB</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link to={`/problems/${problem._id}`}>
                        <Button size="sm" variant="outline">
                          Solve
                        </Button>
                      </Link>
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