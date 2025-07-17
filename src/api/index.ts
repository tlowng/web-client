import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Basic types for API responses
interface UserData {
  username?: string;
  email: string;
  password?: string;
  role?: string;
}

interface ProblemData {
  _id?: string; // Add _id as optional for creation, but present on fetch
  title: string;
  description:string;
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

export interface SubmissionResult {
  _id: string;
  userId: {
    _id: string;
    username: string;
  };
  problemId: {
    _id: string;
    title: string;
  };
  code: string;
  language: string;
  status: string;
  executionTime?: number;
  memoryUsed?: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Define a type for the user profile data returned from the backend
export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
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

// User Profile call
export const getMe = () => api.get<UserProfile>('/auth/me');

// Forum Types
export interface ForumCategory {
  _id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
  color: string;
}

export interface ForumTopic {
    _id: string;
    title: string;
    slug: string;
    content: string;
    author: {
        _id: string;
        username: string;
    };
    category: {
        _id: string;
        name: string;
        slug: string;
    };
    createdAt: string;
    postCount: number;
    viewCount: number;
}

export interface ForumPost {
    _id: string;
    content: string;
    author: {
        _id: string;
        username: string;
    };
    createdAt: string;
    likeCount: number;
}


// Forum calls
export const getForumCategories = () => api.get<ForumCategory[]>('/forum/categories');
export const getCategoryBySlug = (slug: string) => api.get<ForumCategory>(`/forum/categories/${slug}`);
export const getForumTopics = (params?: { page?: number, limit?: number, sort?: string, category?: string }) => api.get<ForumTopic[]>('/forum/topics', { params });
export const getTopicBySlug = (slug: string) => api.get<ForumTopic>(`/forum/topics/${slug}`);
export const getPostsByTopic = (topicId: string) => api.get<ForumPost[]>(`/forum/posts/topic/${topicId}`);
export const searchForumTopics = (query: string) => api.get<ForumTopic[]>(`/forum/topics/search?q=${query}`);
