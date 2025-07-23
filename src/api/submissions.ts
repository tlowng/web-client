// src/api/submissions.ts - FIXED VERSION
import api from './client';
import type { SubmissionData, SubmissionResult, PopulatedSubmissionResult } from '@/types';

export const submitCode = (submissionData: SubmissionData) => 
  api.post<{ submissionId: string }>('/submissions', submissionData).then(res => res.data);

export const getSubmissionById = (id: string) => 
  api.get<SubmissionResult>(`/submissions/${id}`).then(res => res.data);

// Fixed: Add optional filters parameter and correct return type
export const getUserSubmissions = (filters?: {
  status?: string;
  language?: string;
  page?: number;
  limit?: number;
}) => 
  api.get<PopulatedSubmissionResult[]>('/submissions/user-submissions', { params: filters }).then(res => res.data);
