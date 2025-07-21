// src/api/submissions.ts
import api from './client';
import type { SubmissionData, SubmissionResult } from '@/types';

export const submitCode = (submissionData: SubmissionData) => api.post<{ submissionId: string }>('/submissions', submissionData).then(res => res.data);
export const getSubmissionById = (id: string) => api.get<SubmissionResult>(`/submissions/${id}`).then(res => res.data);
export const getUserSubmissions = () => api.get<SubmissionResult[]>('/submissions/user-submissions').then(res => res.data);
