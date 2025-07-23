// src/api/submissions.ts - FINALIZED VERSION
import api from './client';
import type { SubmissionData, PopulatedSubmissionResult, FullyPopulatedSubmissionResult } from '@/types';

export const submitCode = (submissionData: SubmissionData) => 
  api.post<{ submissionId: string }>('/submissions', submissionData).then(res => res.data);

export const getSubmissionById = (id: string) => 
  api.get<FullyPopulatedSubmissionResult>(`/submissions/${id}`).then(res => res.data);

export const getUserSubmissions = (filters?: {
  status?: string;
  language?: string;
  page?: number;
  limit?: number;
}) => 
  api.get<PopulatedSubmissionResult[]>('/submissions/user-submissions', { params: filters }).then(res => res.data);
