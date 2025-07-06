import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getProblems } from '@/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton }
 from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useFetch } from '@/hooks/use-fetch';

interface Problem {
  _id: string;
  title: string;
  difficulty: string;
}

export default function ProblemsPage() {
  const { data: problems, loading, error } = useFetch<Problem[]>(getProblems, []);
  const [searchTerm, setSearchTerm] = useState('');

  const getDifficultyVariant = (difficulty: string | undefined | null) => {
    if (!difficulty) return 'outline'; // Handle undefined or null difficulty

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

  const filteredProblems = problems?.filter(problem =>
    problem.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 space-y-4">
      {/* Search Input moved outside or above the Card for full width */}
      <Input
        type="text"
        placeholder="Search problems..."
        className="w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Card>
        <CardHeader>
          <CardTitle>Problems</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredProblems && filteredProblems.length === 0 ? (
            <p className="text-center text-muted-foreground">No problems found matching your search.</p>
          ) : (
            <div className="overflow-x-auto"> {/* Added overflow-x-auto for responsiveness */}
              <Table className="min-w-full"> {/* Added min-w-full to ensure it takes full width */}
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-center">Difficulty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProblems?.map((problem) => (
                    <TableRow key={problem._id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{problem._id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <Link to={`/problems/${problem._id}`} className="text-blue-600 hover:underline font-medium">
                          {problem.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getDifficultyVariant(problem.difficulty)}>{problem.difficulty}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
