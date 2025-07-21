// src/api/problems.ts
import api from './client';
import type { ProblemData, CreateProblemResponse } from '@/types';

export const getProblemById = (id: string) => api.get<ProblemData>(`/problems/${id}`).then(res => res.data);

export const createProblem = async (problemData: Omit<ProblemData, '_id' | 'createdAt' | 'updatedAt'>): Promise<CreateProblemResponse> => {
    console.log('Creating problem with data:', problemData);
    
    // Validate required fields
    if (!problemData.title?.trim()) {
      throw new Error('Problem title is required');
    }
    
    if (!problemData.description?.trim()) {
      throw new Error('Problem description is required');
    }
    
    if (!problemData.testCases || problemData.testCases.length === 0) {
      throw new Error('At least one test case is required');
    }
    
    // Validate test cases
    const validTestCases = problemData.testCases.filter(tc => tc.input.trim() && tc.output.trim());
    if (validTestCases.length === 0) {
      throw new Error('All test cases must have both input and output');
    }
    
    const response = await api.post<CreateProblemResponse>('/problems', {
      ...problemData,
      testCases: validTestCases
    });
    
    console.log('Problem created successfully:', response.data);
    return response.data;
};

export const getProblems = async (filters?: {
  difficulty?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ProblemData[]> => {
    const params = new URLSearchParams();
    
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.tags && filters.tags.length > 0) {
      params.append('tags', filters.tags.join(','));
    }
    
    const queryString = params.toString();
    const url = queryString ? `/problems?${queryString}` : '/problems';
    
    const response = await api.get<ProblemData[]>(url);
    return response.data;
};

export const getProblemStats = async (): Promise<{
  total: number;
  byDifficulty: { easy: number; medium: number; hard: number };
  recentSubmissions: number;
  popularProblems: Array<{ id: string; title: string; submissionCount: number }>;
}> => {
    const response = await api.get('/problems/stats');
    return response.data;
};

export const updateProblem = async (
  problemId: string, 
  updateData: Partial<Omit<ProblemData, '_id' | 'createdAt'>>
): Promise<ProblemData> => {
    const response = await api.put<ProblemData>(`/problems/${problemId}`, updateData);
    return response.data;
};

export const deleteProblem = async (problemId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/problems/${problemId}`);
    return response.data;
};
