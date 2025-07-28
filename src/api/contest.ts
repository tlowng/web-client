// src/api/contest.ts
import api from './client';
import type { 
  Contest, 
  ContestFormData, 
  ContestRegistrationData,
  ContestSubmission,
  ContestSubmissionData,
  Standings,
  ApiResponse,
  PaginationInfo
} from '@/types';

// Get all contests with filters
export const getContests = async (params?: {
  status?: 'all' | 'upcoming' | 'running' | 'ended' | 'registering';
  type?: 'all' | 'public' | 'private' | 'rated';
  page?: number;
  limit?: number;
}) => {
  const response = await api.get<{
    success: boolean;
    data: {
      contests: Contest[];
      pagination: PaginationInfo;
    };
  }>('/contests', { params });
  return response.data.data;
};

// Get single contest by ID
export const getContestById = async (id: string) => {
  const response = await api.get<ApiResponse<Contest>>(`/contests/${id}`);
  return response.data.data;
};

// Create new contest (admin only)
export const createContest = async (data: ContestFormData) => {
  const response = await api.post<ApiResponse<Contest>>('/contests', data);
  return response.data.data;
};

// Register for a contest
export const registerForContest = async (data: ContestRegistrationData) => {
  const { contestId, password } = data;
  const response = await api.post<ApiResponse<{ message: string }>>(
    `/contests/${contestId}/register`,
    { password }
  );
  return response.data;
};

// Submit solution to contest problem
export const submitToContest = async (data: ContestSubmissionData) => {
  const { contestId, ...submissionData } = data;
  const response = await api.post<ApiResponse<{ submissionId: string }>>(
    `/contests/${contestId}/submit`,
    submissionData
  );
  return response.data;
};


// Get contest standings
export const getContestStandings = async (
  contestId: string,
  params?: { page?: number; limit?: number }
) => {
  const response = await api.get<ApiResponse<Standings>>(
    `/contests/${contestId}/standings`,
    { params }
  );
  return response.data.data;
};

// Get my submissions for a contest
export const getMyContestSubmissions = async (contestId: string) => {
  const response = await api.get<ApiResponse<ContestSubmission[]>>(
    `/contests/${contestId}/submissions`
  );
  return response.data.data;
};

// Publish contest (admin only)
export const publishContest = async (contestId: string) => {
  const response = await api.post<ApiResponse<Contest>>(
    `/contests/${contestId}/publish`
  );
  return response.data.data;
};

// Update contest (admin only)
export const updateContest = async (id: string, data: Partial<ContestFormData>) => {
  const response = await api.put<ApiResponse<Contest>>(`/contests/${id}`, data);
  return response.data.data;
};

// Delete contest (admin only)
export const deleteContest = async (id: string) => {
  const response = await api.delete<ApiResponse<{ message: string }>>(`/contests/${id}`);
  return response.data;
};