// src/pages/ContestDashboardPage.tsx
import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '@/hooks/use-fetch';
import { getContestById, submitToContest, getMyContestSubmissions } from '@/api';
import type { Contest, ContestSubmission } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MonacoEditor from '@monaco-editor/react';
import { 
  Trophy, 
  Clock, 
  Code,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useBreadcrumbTitle } from '@/contexts/breadcrumb-context';

const DEFAULT_CODE = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Your code here
    return 0;
}`,
  java: `public class Solution {
    public static void main(String[] args) {
        // Your code here
    }
}`,
  python: `# Your code here`,
  javascript: `// Your code here`
};

export default function ContestDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedProblem, setSelectedProblem] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [code, setCode] = useState(DEFAULT_CODE[selectedLanguage as keyof typeof DEFAULT_CODE]);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useBreadcrumbTitle('Contest Dashboard');

  const fetchContest = useCallback(async (): Promise<Contest> => {
    if (!id) throw new Error('Contest ID is required');
    return await getContestById(id);
  }, [id]);

  const fetchMySubmissions = useCallback(async (): Promise<ContestSubmission[]> => {
    if (!id) return [];
    return await getMyContestSubmissions(id);
  }, [id]);

  const { data: contest, loading: contestLoading, error: contestError } = useFetch<Contest>(
    fetchContest,
    null,
    [id]
  );

  const { 
    data: submissions, 
    loading: submissionsLoading, 
    refetch: refetchSubmissions 
  } = useFetch<ContestSubmission[]>(
    fetchMySubmissions,
    [],
    [id]
  );

  // Update breadcrumb with contest title
  useBreadcrumbTitle(contest?.title ? `${contest.title} - Dashboard` : 'Contest Dashboard');

  // Set default selected problem
  useEffect(() => {
    if (contest?.problems.length && !selectedProblem) {
      setSelectedProblem(contest.problems[0].label);
    }
  }, [contest, selectedProblem]);

  // Timer countdown
  useEffect(() => {
    if (!contest || contest.status !== 'running') return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(contest.endTime).getTime();
      const remaining = Math.max(0, end - now);
      
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        toast.error('Contest has ended!');
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [contest]);

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setCode(DEFAULT_CODE[language as keyof typeof DEFAULT_CODE] || '');
  };

  const handleSubmit = async () => {
    if (!contest || !selectedProblem || !code.trim() || !id) {
      toast.error('Please select a problem and write code before submitting');
      return;
    }

    setSubmitting(true);
    try {
      await submitToContest({
        contestId: id,
        problemId: selectedProblem, // This is the label (A, B, C...)
        code,
        language: selectedLanguage
      });
      
      toast.success(`Solution submitted for Problem ${selectedProblem}!`);
      refetchSubmissions();
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

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

  if (contestLoading) {
    return (
      <div className="p-4 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (contestError || !contest) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {contestError || 'Failed to load contest'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (contest.status !== 'running') {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Contest is not running</p>
            <p className="text-muted-foreground mb-4">
              {contest.status === 'upcoming' 
                ? 'This contest has not started yet.' 
                : 'This contest has ended.'}
            </p>
            <Button asChild>
              <Link to={`/contests/${id}`}>Back to Contest Details</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedProblemData = contest.problems.find(p => p.label === selectedProblem);

  return (
    <div className="p-4 space-y-4">
      {/* Header with Timer */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{contest.title}</h1>
        <div className="flex items-center gap-4">
          <Badge variant="default" className="text-lg px-4 py-1">
            <Timer className="h-4 w-4 mr-2" />
            {formatTime(timeLeft)}
          </Badge>
          <Button variant="outline" asChild>
            <Link to={`/contests/${id}/standings`}>
              View Standings
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Problems & Submissions */}
        <div className="space-y-6">
          {/* Problems List */}
          <Card>
            <CardHeader>
              <CardTitle>Problems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {contest.problems.map((problem) => {
                  const submission = submissions.find(s => s.problemLabel === problem.label);
                  const isSelected = selectedProblem === problem.label;
                  
                  return (
                    <Button
                      key={problem.label}
                      variant={isSelected ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setSelectedProblem(problem.label)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {problem.label}
                          </Badge>
                          <span className="truncate">
                            {problem.problem.title}
                          </span>
                        </div>
                        {submission && (
                          submission.isAccepted 
                            ? <CheckCircle className="h-4 w-4 text-green-500" />
                            : <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* My Submissions */}
          <Card>
            <CardHeader>
              <CardTitle>My Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {submissionsLoading ? (
                <Skeleton className="h-20" />
              ) : submissions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No submissions yet
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {submissions.map((submission) => (
                    <div 
                      key={submission._id}
                      className="flex items-center justify-between p-2 rounded border text-sm"
                    >
                      <div className="flex items-center gap-2">
                        {getStatusIcon(submission.submission)}
                        <span className="font-mono">{submission.problemLabel}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {submission.submissionTime}m
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Problem & Code Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="problem" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="problem">Problem</TabsTrigger>
              <TabsTrigger value="editor">Code Editor</TabsTrigger>
            </TabsList>
            
            <TabsContent value="problem" className="mt-4">
              {selectedProblemData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>
                        Problem {selectedProblemData.label}: {selectedProblemData.problem.title}
                      </span>
                      <Badge>{selectedProblemData.points} points</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <div className="mb-4 flex items-center gap-4 text-sm">
                        <Badge variant="outline">
                          {selectedProblemData.problem.difficulty}
                        </Badge>
                        <span className="text-muted-foreground">
                          Time Limit: {selectedProblemData.problem.timeLimit}ms
                        </span>
                        <span className="text-muted-foreground">
                          Memory Limit: {selectedProblemData.problem.memoryLimit}MB
                        </span>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Problem Description</h3>
                        <div className="whitespace-pre-wrap">
                          {selectedProblemData.problem.description}
                        </div>
                      </div>

                      {selectedProblemData.problem.testCases?.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold mb-2">Sample Test Cases</h3>
                          {selectedProblemData.problem.testCases.map((testCase, index) => (
                            <div key={index} className="mt-4 border rounded-lg p-4">
                              <h4 className="font-medium mb-2">Example {index + 1}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="text-sm font-medium text-muted-foreground mb-1">Input:</h5>
                                  <pre className="bg-muted p-2 rounded text-sm overflow-x-auto">
                                    {testCase.input}
                                  </pre>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-muted-foreground mb-1">Output:</h5>
                                  <pre className="bg-muted p-2 rounded text-sm overflow-x-auto">
                                    {testCase.output}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="editor" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Code Editor</CardTitle>
                    <div className="flex items-center gap-2">
                      <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {contest.allowedLanguages.map(lang => (
                            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={handleSubmit} 
                        disabled={submitting || !selectedProblem}
                      >
                        {submitting ? (
                          <>Submitting...</>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Submit
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <MonacoEditor
                      height="500px"
                      language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
                      theme="vs-dark"
                      value={code}
                      onChange={(value) => setCode(value || '')}
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        automaticLayout: true,
                        wordWrap: 'on',
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}