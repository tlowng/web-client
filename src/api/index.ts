// src/api/index.ts
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
  _id?: string;
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

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
}

// Auth calls
export const registerUser = (userData: UserData) => api.post('/auth/signup', userData).then(res => res.data);
export const loginUser = (credentials: UserData) => api.post('/auth/login', credentials).then(res => res.data);

// Problem calls
export const getProblems = () => api.get<ProblemData[]>('/problems').then(res => res.data);
export const getProblemById = (id: string) => api.get<ProblemData>(`/problems/${id}`).then(res => res.data);
export const createProblem = (problemData: ProblemData) => api.post('/problems', problemData).then(res => res.data);

// Submission calls
export const submitCode = (submissionData: SubmissionData) => api.post<{ submissionId: string }>('/submissions', submissionData).then(res => res.data);
export const getSubmissionById = (id: string) => api.get<SubmissionResult>(`/submissions/${id}`).then(res => res.data);
export const getUserSubmissions = () => api.get<SubmissionResult[]>('/submissions/user-submissions').then(res => res.data);

// User Profile call
export const getMe = () => api.get<UserProfile>('/auth/me').then(res => res.data);

// Forum Types
export interface ForumCategory {
  _id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
  color: string;
  order?: number;
  topicCount?: number;
  postCount?: number;
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
  } | null; // Allow null for topics without category
  createdAt: string;
  postCount?: number;
  replyCount?: number;
  viewCount: number;
  isPinned?: boolean;
  isLocked?: boolean;
  tags?: string[];
  lastActivity?: string;
}

export interface ForumPost {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  topic: string;
  replyTo?: string | null;
  likeCount: number;
  userLiked?: boolean;
  userLikeType?: string | null;
  createdAt: string;
}

export interface ForumTopicsResponse {
  topics: ForumTopic[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PostsResponse {
  posts: ForumPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API Response wrapper interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Fixed Forum API calls
export const getForumCategories = async () => {
  try {
    const response = await api.get<ApiResponse<ForumCategory[]>>("/forum/categories");
    console.log(">>> Full categories API response:", response);
    // API returns { success: true, data: [...] }
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch forum categories:", error);
    throw error;
  }
};

export const getCategoryBySlug = async (slug: string) => {
  try {
    const response = await api.get<ApiResponse<ForumCategory>>(`/forum/categories/${slug}`);
    // API returns { success: true, data: {...} }
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch category ${slug}:`, error);
    throw error;
  }
};

export const getForumTopics = async (params?: {
  page?: number;
  limit?: number;
  sort?: string;
  category?: string;
}) => {
  try {
    const response = await api.get<ApiResponse<ForumTopicsResponse>>("/forum/topics", {
      params,
    });
    console.log(">>> Full topics API response:", response);
    // API returns { success: true, data: { topics: [...], pagination: {...} } }
    return response.data.data.topics;
  } catch (error) {
    console.error("Failed to fetch forum topics:", error);
    throw error;
  }
};

export const getTopicBySlug = async (slug: string) => {
  try {
    const response = await api.get<ApiResponse<ForumTopic>>(`/forum/topics/${slug}`);
    // API returns { success: true, data: {...} }
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch topic ${slug}:`, error);
    throw error;
  }
};

export const getPostsByTopic = async (topicId: string, params?: {
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await api.get<ApiResponse<PostsResponse>>(`/forum/posts/topic/${topicId}`, {
      params,
    });
    // API returns { success: true, data: { posts: [...], pagination: {...} } }
    return response.data.data.posts;
  } catch (error) {
    console.error(`Failed to fetch posts for topic ${topicId}:`, error);
    throw error;
  }
};

export const searchForumTopics = async (query: string, params?: {
  categoryId?: string;
  tags?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const searchParams = {
      q: query,
      ...params,
    };
    const response = await api.get<ApiResponse<ForumTopicsResponse>>(`/forum/topics/search`, {
      params: searchParams,
    });
    // API returns { success: true, data: { topics: [...], pagination: {...} } }
    return response.data.data.topics;
  } catch (error) {
    console.error("Failed to search forum topics:", error);
    throw error;
  }
};