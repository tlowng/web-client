// src/pages/ProblemDetailPage.tsx - FIXED VERSION
import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useFetch } from '@/hooks/use-fetch';
import { getProblemById, submitCode } from '@/api';
import type { ProblemData, SubmissionData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Clock, MemoryStick, Play, Code, TestTube } from 'lucide-react';
import MonacoEditor from '@monaco-editor/react'; // Fixed: Use Monaco Editor
import { toast } from 'sonner';
import { getDifficultyVariant, getDifficultyColor } from '@/utils/ui-helpers';
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

export default function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [code, setCode] = useState(DEFAULT_CODE[selectedLanguage as keyof typeof DEFAULT_CODE]);
  const [submitting, setSubmitting] = useState(false);

  const fetchProblem = useCallback(async (): Promise<ProblemData> => {
    if (!id) throw new Error('Problem ID is required');
    return await getProblemById(id);
  }, [id]);

  const { data: problem, loading, error, refetch } = useFetch<ProblemData>(
    fetchProblem,
    null,
    [id]
  );

  useBreadcrumbTitle(problem?.title || 'Problem Detail');

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setCode(DEFAULT_CODE[language as keyof typeof DEFAULT_CODE] || '');
  };

  const handleSubmit = async () => {
    if (!problem || !code.trim()) {
      toast.error('Please write some code before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const submissionData: SubmissionData = {
        problemId: problem._id!,
        code,
        language: selectedLanguage
      };
      
      const result = await submitCode(submissionData); // Fixed: Use submitCode
      
      toast.success('Solution submitted successfully!', {
        description: `Submission ID: ${result.submissionId}`
      });
      console.log('Submission result:', result);
    } catch (error: any) {
      console.error('Submission failed:', error);
      toast.error(error.response?.data?.message || 'Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-80 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-red-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Error loading problem: {error || 'Problem not found'}</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Description */}
        <div className="space-y-6">
          {/* Problem Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{problem.title}</CardTitle>
                  <div className="flex items-center gap-4">
                    <Badge 
                      variant={getDifficultyVariant(problem.difficulty)}
                      className={getDifficultyColor(problem.difficulty)}
                    >
                      {problem.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {problem.timeLimit}ms
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MemoryStick className="h-4 w-4" />
                      {problem.memoryLimit}MB
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: problem.description }}
              />
            </CardContent>
          </Card>

          {/* Test Cases */}
          {problem.testCases && problem.testCases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Sample Test Cases
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {problem.testCases.map((testCase, index) => (
                  <div key={index} className="border rounded-lg p-4">
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
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {problem.tags && problem.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {problem.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Code Editor */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Solution
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={submitting || !code.trim()}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {submitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <MonacoEditor
                  height="400px"
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

          {/* Submission Info */}
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <h4 className="font-medium text-foreground">Submission Guidelines:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Make sure your solution handles all edge cases</li>
                  <li>Pay attention to time and memory limits</li>
                  <li>Test with the provided sample inputs</li>
                  <li>Code will be judged on multiple test cases</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
