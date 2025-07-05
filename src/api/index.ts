import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token; // Use x-auth-token as per backend
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Basic types for API responses (you might want to expand these)
interface UserData {
  username?: string;
  email: string;
  password?: string;
  role?: string;
}

interface ProblemData {
  title: string;
  description: string;
  difficulty: string;
  timeLimit: number;
  memoryLimit: number;
  testCases: Array<{ input: string; output: string }>;
}

interface SubmissionData {
  problemId: string;
  code: string;
  language: string;
}

interface SubmissionResult {
  _id: string;
  userId: string;
  problemId: string;
  code: string;
  language: string;
  status: string;
  executionTime?: number;
  memoryUsed?: number;
  createdAt: string;
  updatedAt: string;
}

// Auth calls
export const registerUser = (userData: UserData) => api.post('/auth/signup', userData);
export const loginUser = (credentials: UserData) => api.post('/auth/login', credentials);

// Problem calls
export const getProblems = () => api.get<ProblemData[]>('/problems');
export const getProblemById = (id: string) => api.get<ProblemData>(`/problems/${id}`);
export const createProblem = (problemData: ProblemData) => api.post('/problems', problemData);

// Submission calls
export const submitCode = (submissionData: SubmissionData) => api.post<{ submissionId: string }>('/submissions', submissionData);
export const getSubmissionById = (id: string) => api.get<SubmissionResult>(`/submissions/${id}`);
export const getUserSubmissions = () => api.get<SubmissionResult[]>('/submissions/user-submissions');
