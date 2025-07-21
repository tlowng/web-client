// src/components/admin/create-problem-dialog.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { createProblem } from '@/api';
import { Plus, X, TestTube, Clock, MemoryStick } from 'lucide-react';
import type { TestCase } from '@/types';

interface CreateProblemDialogProps {
  children: React.ReactNode;
  onProblemCreated?: () => void;
}

export function CreateProblemDialog({ children, onProblemCreated }: CreateProblemDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    timeLimit: 1000,
    memoryLimit: 256,
  });
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: '', output: '' }
  ]);

  const difficulties = [
    { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-800' }
  ];

  const addTestCase = () => {
    setTestCases([...testCases, { input: '', output: '' }]);
  };

  const removeTestCase = (index: number) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter((_, i) => i !== index));
    }
  };

  const updateTestCase = (index: number, field: 'input' | 'output', value: string) => {
    const updated = testCases.map((testCase, i) => 
      i === index ? { ...testCase, [field]: value } : testCase
    );
    setTestCases(updated);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a problem title');
      return false;
    }

    if (formData.title.length < 3) {
      toast.error('Title must be at least 3 characters long');
      return false;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a problem description');
      return false;
    }

    if (formData.description.length < 10) {
      toast.error('Description must be at least 10 characters long');
      return false;
    }

    if (formData.timeLimit < 100 || formData.timeLimit > 10000) {
      toast.error('Time limit must be between 100ms and 10000ms');
      return false;
    }

    if (formData.memoryLimit < 64 || formData.memoryLimit > 1024) {
      toast.error('Memory limit must be between 64MB and 1024MB');
      return false;
    }

    // Validate test cases
    const validTestCases = testCases.filter(tc => tc.input.trim() && tc.output.trim());
    if (validTestCases.length === 0) {
      toast.error('Please add at least one test case with input and output');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Filter out empty test cases
      const validTestCases = testCases.filter(tc => tc.input.trim() && tc.output.trim());

      const problemData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        testCases: validTestCases,
      };

      await createProblem(problemData);
      
      toast.success('Problem created successfully!');
      setOpen(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        difficulty: 'easy',
        timeLimit: 1000,
        memoryLimit: 256,
      });
      setTestCases([{ input: '', output: '' }]);
      
      onProblemCreated?.();
      
    } catch (error: any) {
      console.error('Failed to create problem:', error);
      toast.error(error.response?.data?.message || 'Failed to create problem.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !loading) {
      // Reset form when closing
      setFormData({
        title: '',
        description: '',
        difficulty: 'easy',
        timeLimit: 1000,
        memoryLimit: 256,
      });
      setTestCases([{ input: '', output: '' }]);
    }
    setOpen(newOpen);
  };

  const selectedDifficulty = difficulties.find(d => d.value === formData.difficulty);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Create New Problem
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Two Sum, Binary Search, etc."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the problem statement, constraints, input/output format..."
                  className="min-h-[120px] resize-y"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
                <div className="text-xs text-muted-foreground">
                  {formData.description.length} characters
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="difficulty">Difficulty *</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value as 'easy' | 'medium' | 'hard' }))}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map(diff => (
                        <SelectItem key={diff.value} value={diff.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={diff.color}>
                              {diff.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="timeLimit" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Time Limit (ms) *
                  </Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="100"
                    max="10000"
                    step="100"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      timeLimit: parseInt(e.target.value) || 1000 
                    }))}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="memoryLimit" className="flex items-center gap-1">
                    <MemoryStick className="h-4 w-4" />
                    Memory Limit (MB) *
                  </Label>
                  <Input
                    id="memoryLimit"
                    type="number"
                    min="64"
                    max="1024"
                    step="64"
                    value={formData.memoryLimit}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      memoryLimit: parseInt(e.target.value) || 256 
                    }))}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Cases */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Test Cases</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTestCase}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Test Case
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {testCases.map((testCase, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Test Case {index + 1}</h4>
                    {testCases.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTestCase(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor={`input-${index}`}>Input</Label>
                      <Textarea
                        id={`input-${index}`}
                        placeholder="Enter test case input..."
                        className="min-h-[80px] font-mono text-sm"
                        value={testCase.input}
                        onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor={`output-${index}`}>Expected Output</Label>
                      <Textarea
                        id={`output-${index}`}
                        placeholder="Enter expected output..."
                        className="min-h-[80px] font-mono text-sm"
                        value={testCase.output}
                        onChange={(e) => updateTestCase(index, 'output', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="text-sm text-muted-foreground">
                <p>💡 Tips:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Add multiple test cases to thoroughly test solutions</li>
                  <li>Include edge cases (empty input, maximum constraints, etc.)</li>
                  <li>Ensure input/output format matches your problem description</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Title:</span>
                <span>{formData.title || 'Untitled Problem'}</span>
                {selectedDifficulty && (
                  <Badge className={selectedDifficulty.color}>
                    {selectedDifficulty.label}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formData.timeLimit}ms
                </span>
                <span className="flex items-center gap-1">
                  <MemoryStick className="h-4 w-4" />
                  {formData.memoryLimit}MB
                </span>
                <span className="flex items-center gap-1">
                  <TestTube className="h-4 w-4" />
                  {testCases.filter(tc => tc.input.trim() && tc.output.trim()).length} test cases
                </span>
              </div>
              
              {formData.description && (
                <div className="mt-3 p-3 bg-muted rounded border-l-4 border-primary">
                  <p className="text-sm whitespace-pre-wrap">{formData.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Problem'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}