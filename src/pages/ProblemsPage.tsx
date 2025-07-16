import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getProblems } from '@/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useFetch } from '@/hooks/use-fetch';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LayoutGrid, Table as TableIcon } from 'lucide-react';

interface Problem {
  _id: string;
  title?: string;
  difficulty?: string;
  tags?: string[];
  acceptance: number;
  submissionCount: number;
}

export default function ProblemsPage() {
  const { data: problems, loading, error } = useFetch<Problem[]>(getProblems, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const getDifficultyVariant = (difficulty: string | undefined | null) => {
    if (!difficulty) return 'outline';
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

  const filteredProblems = problems?.filter(problem => {
    const title = problem.title ?? '';
    const difficulty = problem.difficulty ?? '';
    const tags = problem.tags ?? [];

    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || difficulty.toLowerCase() === selectedDifficulty;
    const matchesTag = selectedTag === 'all' || tags.some(tag => tag.toLowerCase() === selectedTag);

    return matchesSearch && matchesDifficulty && matchesTag;
  });

  const allTags = Array.from(new Set(problems?.flatMap(problem => problem.tags ?? []) || []));

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  const renderCardView = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredProblems?.map(problem => (
        <Link
          key={problem._id}
          to={`/problems/${problem._id}`}
          className="hover:shadow-lg transition-shadow"
        >
          <Card className="h-full">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{problem.title ?? 'Untitled'}</CardTitle>
                <Badge
                  variant={getDifficultyVariant(problem.difficulty)}
                  className="px-2 py-1 text-sm"
                >
                  {problem.difficulty ?? 'Unknown'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex flex-wrap gap-2 mb-3">
                {(problem.tags ?? []).map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-sm font-normal"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Acceptance</span>
                  <span>{problem.acceptance ?? 0}%</span>
                </div>
                <Progress value={problem.acceptance ?? 0} />
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 text-sm text-muted-foreground">
              {(problem.submissionCount ?? 0).toLocaleString()} submissions
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="overflow-x-auto w-full">
      <Table className="w-full min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="text-center">Difficulty</TableHead>
            <TableHead className="text-center">Acceptance</TableHead>
            <TableHead className="text-center">Submissions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProblems?.map(problem => (
            <TableRow key={problem._id}>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {problem._id.slice(0, 8)}
              </TableCell>
              <TableCell>
                <Link to={`/problems/${problem._id}`} className="text-primary hover:underline font-medium">
                  {problem.title ?? 'Untitled'}
                </Link>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={getDifficultyVariant(problem.difficulty)}>
                  {problem.difficulty ?? 'Unknown'}
                </Badge>
              </TableCell>
              <TableCell className="text-center">{problem.acceptance ?? 0}%</TableCell>
              <TableCell className="text-center">{(problem.submissionCount ?? 0).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="p-4 space-y-4 w-full flex-1">
      <div className="grid gap-4 md:grid-cols-3">
        <Input
          placeholder="Search problems..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedTag} onValueChange={setSelectedTag}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {allTags.map(tag => (
              <SelectItem key={tag} value={tag.toLowerCase()}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end items-center gap-2">
        <TableIcon className={viewMode === 'table' ? 'text-primary' : 'text-muted-foreground'} size={18} />
        <Switch
          checked={viewMode === 'card'}
          onCheckedChange={(checked) => setViewMode(checked ? 'card' : 'table')}
        />
        <LayoutGrid className={viewMode === 'card' ? 'text-primary' : 'text-muted-foreground'} size={18} />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-32">
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProblems?.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No problems found matching your criteria
        </div>
      ) : viewMode === 'card' ? renderCardView() : renderTableView()}
    </div>
  );
}
