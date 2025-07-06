import { useParams, useNavigate } from 'react-router-dom';
import { getProblemById, submitCode } from '@/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton }
 from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MonacoEditor from '@monaco-editor/react';
import { useState, useCallback } from 'react';
import { useFetch } from '@/hooks/use-fetch';

interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: number;
  memoryLimit: number;
  testCases: Array<{ input: string; output: string }>;
}

export default function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const fetchProblemDetails = useCallback(() => {
    if (!id) {
      return Promise.reject(new Error('Problem ID is missing.'));
    }
    return getProblemById(id);
  }, [id]);

  const { data: problem, loading, error } = useFetch<Problem>(fetchProblemDetails);

  const [code, setCode] = useState<string>('// Write your code here');
  const [language, setLanguage] = useState<string>('cpp'); // Default language
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!problem || !id) return;
    setIsSubmitting(true);
    try {
      const submissionData = {
        problemId: id,
        code,
        language,
      };
      const response = await submitCode(submissionData);
      toast.success('Submission Successful', {
        description: `Your submission ${response.data.submissionId} has been queued.`,
      });
      navigate(`/submissions/${response.data.submissionId}`);
    } catch (err) {
      toast.error('Submission Failed', {
        description: 'There was an error submitting your code.',
      });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-10 w-1/4" />
      </div>
    );
  }

  if (!problem) {
    return <div className="p-4 text-muted-foreground">Problem not found.</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{problem.title}</CardTitle>
          <CardDescription>Difficulty: {problem.difficulty} | Time Limit: {problem.timeLimit}s | Memory Limit: {problem.memoryLimit}MB</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{problem.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Code Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="language">Language</Label>
            <Select onValueChange={setLanguage} defaultValue={language}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <MonacoEditor
            height="500px"
            language={language === 'cpp' ? 'cpp' : language === 'python' ? 'python' : 'javascript'}
            theme="vs-dark"
            value={code}
            onChange={(newValue) => setCode(newValue || '')}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              fontSize: 14,
            }}
          />
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Code'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
