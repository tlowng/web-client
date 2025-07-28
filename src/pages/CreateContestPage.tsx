// src/pages/CreateContestPage.tsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '@/hooks/use-fetch';
import { createContest, getProblems } from '@/api';
import type { ContestFormData, ProblemData, ContestType, ScoringSystem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trophy, 
  Save,
  Plus,
  X,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { useBreadcrumbTitle } from '@/contexts/breadcrumb-context';

const LANGUAGES = ['cpp', 'java', 'python', 'javascript', 'go', 'rust'];

// Helper to get current local datetime string for input default
const toLocalISOString = (date: Date) => {
  const tzo = -date.getTimezoneOffset();
  const dif = tzo >= 0 ? '+' : '-';
  const pad = (num: number) => (num < 10 ? '0' : '') + num;

  return date.getFullYear() +
    '-' + pad(date.getMonth() + 1) +
    '-' + pad(date.getDate()) +
    'T' + pad(date.getHours()) +
    ':' + pad(date.getMinutes());
};


export default function CreateContestPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState<Array<{
    problemId: string;
    label: string;
    points: number;
  }>>([]);

  const [formData, setFormData] = useState<ContestFormData>({
    title: '',
    description: '',
    startTime: toLocalISOString(new Date(Date.now() + 60 * 60 * 1000)), // Default to 1 hour from now
    endTime: toLocalISOString(new Date(Date.now() + 2 * 60 * 60 * 1000)), // Default to 2 hours from now
    type: 'public' as ContestType,
    scoringSystem: 'ICPC' as ScoringSystem,
    allowedLanguages: ['cpp', 'java', 'python'],
    maxSubmissions: 0,
    freezeTime: 60,
    isRated: false,
    password: '',
    settings: {
      showOthersCode: false,
      allowClarifications: true,
      penaltyPerWrongSubmission: 20,
      enablePlagiarismCheck: true,
      autoPublishResults: true
    },
    problems: []
  });

  useBreadcrumbTitle('Create Contest');

  const fetchProblems = useCallback(async (): Promise<ProblemData[]> => {
    const response = await getProblems({});
    return response.problems;
  }, []);

  const { data: problems = [], loading: problemsLoading } = useFetch<ProblemData[]>(
    fetchProblems,
    []
  );

  const handleAddProblem = (problemId: string) => {
    if (selectedProblems.find(p => p.problemId === problemId)) {
      toast.error('Problem already added');
      return;
    }

    if (selectedProblems.length >= 26) {
      toast.error('Maximum 26 problems allowed');
      return;
    }

    const nextLabel = String.fromCharCode(65 + selectedProblems.length);
    setSelectedProblems([...selectedProblems, {
      problemId,
      label: nextLabel,
      points: 100
    }]);
  };

  const handleRemoveProblem = (problemId: string) => {
    const newProblems = selectedProblems.filter(p => p.problemId !== problemId);
    // Re-assign labels
    const reorderedProblems = newProblems.map((p, index) => ({
      ...p,
      label: String.fromCharCode(65 + index)
    }));
    setSelectedProblems(reorderedProblems);
  };

  const handleUpdatePoints = (problemId: string, points: number) => {
    setSelectedProblems(selectedProblems.map(p => 
      p.problemId === problemId ? { ...p, points } : p
    ));
  };

  const handleLanguageToggle = (language: string) => {
    const current = formData.allowedLanguages;
    if (current.includes(language)) {
      if (current.length === 1) {
        toast.error('At least one language must be selected');
        return;
      }
      setFormData({
        ...formData,
        allowedLanguages: current.filter(l => l !== language)
      });
    } else {
      setFormData({
        ...formData,
        allowedLanguages: [...current, language]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    const now = new Date();

    // Validation
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedProblems.length === 0) {
      toast.error('Please add at least one problem');
      return;
    }

    if (startTime <= now) {
      toast.error('Start time must be in the future');
      return;
    }

    if (endTime <= startTime) {
      toast.error('End time must be after start time');
      return;
    }

    setSubmitting(true);
    try {
      // Send UTC strings to backend
      const contestData: ContestFormData = {
        ...formData,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        problems: selectedProblems
      };

      const contest = await createContest(contestData);
      toast.success('Contest created successfully! Remember to publish it when ready.');
      navigate(`/contests/${contest._id}`);
    } catch (error: any) {
      console.error('Create contest error:', error);
      toast.error(error.response?.data?.message || 'Failed to create contest');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Create New Contest
        </h1>
        <p className="text-muted-foreground mt-1">
          Create a new programming contest. It will be saved as a draft until you publish it.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Contests are created as drafts by default. You can publish them later from the contest details page.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="problems">Problems</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Set up the basic details of your contest
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Contest Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Weekly Contest #42"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your contest..."
                    rows={5}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Contest Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="rated">Rated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.type === 'private' && (
                    <div>
                      <Label htmlFor="password">Contest Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Required for private contests"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRated"
                    checked={formData.isRated}
                    onCheckedChange={(checked) => setFormData({ ...formData, isRated: checked as boolean })}
                  />
                  <Label htmlFor="isRated">
                    This is a rated contest (affects user ratings)
                  </Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Problems Tab */}
          <TabsContent value="problems">
            <Card>
              <CardHeader>
                <CardTitle>Contest Problems</CardTitle>
                <CardDescription>
                  Select problems and assign points for this contest
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedProblems.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Selected Problems ({selectedProblems.length})</h4>
                    <div className="space-y-2">
                      {selectedProblems.map((sp) => {
                        const problem = problems?.find(p => p._id === sp.problemId);
                        return (
                          <div key={sp.problemId} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="font-mono">
                                {sp.label}
                              </Badge>
                              <span className="font-medium">{problem?.title}</span>
                              <Badge variant="secondary">{problem?.difficulty}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={sp.points}
                                onChange={(e) => handleUpdatePoints(sp.problemId, parseInt(e.target.value) || 0)}
                                className="w-20"
                                min="1"
                                max="1000"
                              />
                              <span className="text-sm">points</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveProblem(sp.problemId)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-3">Available Problems</h4>
                  {problemsLoading ? (
                    <p className="text-muted-foreground">Loading problems...</p>
                  ) : problems?.length === 0 ? (
                    <p className="text-muted-foreground">No problems available</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {problems?.filter(p => !selectedProblems.find(sp => sp.problemId === p._id)).map((problem) => (
                        <div 
                          key={problem._id} 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{problem.title}</span>
                            <Badge variant="secondary">{problem.difficulty}</Badge>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddProblem(problem._id!)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Contest Settings</CardTitle>
                <CardDescription>
                  Configure scoring and language settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="scoringSystem">Scoring System</Label>
                  <Select 
                    value={formData.scoringSystem} 
                    onValueChange={(value: any) => setFormData({ ...formData, scoringSystem: value })}
                  >
                    <SelectTrigger id="scoringSystem">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ICPC">ICPC (Binary scoring + time penalty)</SelectItem>
                      <SelectItem value="IOI">IOI (Partial scoring)</SelectItem>
                      <SelectItem value="AtCoder">AtCoder (Points with time penalty)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Allowed Languages</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {LANGUAGES.map((lang) => (
                      <div key={lang} className="flex items-center space-x-2">
                        <Checkbox
                          id={lang}
                          checked={formData.allowedLanguages.includes(lang)}
                          onCheckedChange={() => handleLanguageToggle(lang)}
                        />
                        <Label htmlFor={lang} className="cursor-pointer">
                          {lang}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxSubmissions">Max Submissions (0 = unlimited)</Label>
                    <Input
                      id="maxSubmissions"
                      type="number"
                      value={formData.maxSubmissions}
                      onChange={(e) => setFormData({ ...formData, maxSubmissions: parseInt(e.target.value) || 0 })}
                      min="0"
                      max="50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="freezeTime">Standings Freeze Time (minutes before end)</Label>
                    <Input
                      id="freezeTime"
                      type="number"
                      value={formData.freezeTime}
                      onChange={(e) => setFormData({ ...formData, freezeTime: parseInt(e.target.value) || 0 })}
                      min="0"
                      max="300"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="penalty">Penalty per Wrong Submission</Label>
                  <Input
                    id="penalty"
                    type="number"
                    value={formData.settings.penaltyPerWrongSubmission}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        penaltyPerWrongSubmission: parseInt(e.target.value) || 0
                      }
                    })}
                    min="0"
                    max="100"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Additional contest configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showOthersCode"
                      checked={formData.settings.showOthersCode}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, showOthersCode: checked as boolean }
                      })}
                    />
                    <Label htmlFor="showOthersCode">
                      Allow participants to view others' code after contest ends
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowClarifications"
                      checked={formData.settings.allowClarifications}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, allowClarifications: checked as boolean }
                      })}
                    />
                    <Label htmlFor="allowClarifications">
                      Allow clarification requests during contest
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enablePlagiarismCheck"
                      checked={formData.settings.enablePlagiarismCheck}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, enablePlagiarismCheck: checked as boolean }
                      })}
                    />
                    <Label htmlFor="enablePlagiarismCheck">
                      Enable plagiarism detection
                    </el-label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoPublishResults"
                      checked={formData.settings.autoPublishResults}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, autoPublishResults: checked as boolean }
                      })}
                    />
                    <Label htmlFor="autoPublishResults">
                      Automatically publish results when contest ends
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/contests')}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={submitting || selectedProblems.length === 0}
          >
            {submitting ? (
              <>Creating...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Contest
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}