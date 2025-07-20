// src/api/index.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
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

export interface ProblemData {
  _id?: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in milliseconds
  memoryLimit: number; // in MB
  testCases: TestCase[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TestCase {
  input: string;
  output: string;
}

// Response types for better type safety
export interface CreateProblemResponse {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: number;
  memoryLimit: number;
  testCases: TestCase[];
  createdAt: string;
  message?: string;
}

export interface ProblemsListResponse {
  problems: ProblemData[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
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
  createdAt: string;
  updatedAt?: string;
}

// Auth calls
export const registerUser = (userData: UserData) => api.post('/auth/signup', userData).then(res => res.data);
export const loginUser = (credentials: UserData) => api.post('/auth/login', credentials).then(res => res.data);

// Problem calls
export const getProblemById = (id: string) => api.get<ProblemData>(`/problems/${id}`).then(res => res.data);

// Updated API functions with better error handling and types
export const createProblem = async (problemData: Omit<ProblemData, '_id' | 'createdAt' | 'updatedAt'>): Promise<CreateProblemResponse> => {
  try {
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
    
  } catch (error: any) {
    console.error('Failed to create problem:', error);
    
    // Enhanced error handling
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data?.message || 'Invalid problem data provided');
        case 401:
          throw new Error('Authentication required. Please log in again.');
        case 403:
          throw new Error('You do not have permission to create problems');
        case 429:
          throw new Error('Too many requests. Please wait before creating another problem.');
        default:
          throw new Error(data?.message || `Server error (${status})`);
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

// Enhanced getProblems with optional filters
export const getProblems = async (filters?: {
  difficulty?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ProblemData[]> => {
  try {
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
    
  } catch (error: any) {
    console.error('Failed to fetch problems:', error);
    throw error;
  }
};

// Get problem statistics for admin dashboard
export const getProblemStats = async (): Promise<{
  total: number;
  byDifficulty: { easy: number; medium: number; hard: number };
  recentSubmissions: number;
  popularProblems: Array<{ id: string; title: string; submissionCount: number }>;
}> => {
  try {
    const response = await api.get('/problems/stats');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch problem statistics:', error);
    throw error;
  }
};

// Update problem (admin only)
export const updateProblem = async (
  problemId: string, 
  updateData: Partial<Omit<ProblemData, '_id' | 'createdAt'>>
): Promise<ProblemData> => {
  try {
    const response = await api.put<ProblemData>(`/problems/${problemId}`, updateData);
    return response.data;
  } catch (error: any) {
    console.error('Failed to update problem:', error);
    throw error;
  }
};

// Delete problem (admin only)
export const deleteProblem = async (problemId: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/problems/${problemId}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to delete problem:', error);
    throw error;
  }
};


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

// Create new forum topic
export const createForumTopic = async (data: {
  title: string;
  content: string;
  categoryId: string;
  tags?: string[];
}) => {
  try {
    // Debug: Check token
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    console.log('Request data:', data);
    
    const response = await api.post<ApiResponse<ForumTopic>>('/forum/topics', data);
    return response.data;
  } catch (error) {
    console.error("Failed to create forum topic:", error);
    // Log more details about the error
    if (axios.isAxiosError(error)) {
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
    }
    throw error;
  }
};

// Create new forum post
export const createForumPost = async (data: {
  content: string;
  topicId: string;
  replyToPostId?: string;
}) => {
  try {
    const response = await api.post<ApiResponse<ForumPost>>('/forum/posts', data);
    return response.data;
  } catch (error) {
    console.error("Failed to create forum post:", error);
    throw error;
  }
};

// Like/unlike post
export const likeForumPost = async (postId: string, type: string = 'like') => {
  try {
    const response = await api.post<ApiResponse<{
      message: string;
      liked: boolean;
      likeType: string | null;
    }>>(`/forum/posts/${postId}/like`, { type });
    return response.data;
  } catch (error) {
    console.error("Failed to like forum post:", error);
    throw error;
  }
};

// Delete post
export const deleteForumPost = async (postId: string) => {
  try {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/forum/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete forum post:", error);
    throw error;
  }
};

// Forum profile interfaces
export interface ForumProfile {
  signature?: string;
  title?: string;
  location?: string;
  website?: string;
  githubProfile?: string;
  postCount: number;
  topicCount: number;
  reputation: number;
  preferences?: {
    emailNotifications: boolean;
    showOnlineStatus: boolean;
  };
  lastSeen?: string;
}

export interface UserWithProfile {
  user: UserProfile;
  profile: ForumProfile;
  recentActivity?: {
    topics: ForumTopic[];
    posts: ForumPost[];
  };
}

// Get forum profile
export const getForumProfile = async (userId: string) => {
  try {
    const response = await api.get<ApiResponse<UserWithProfile>>(`/forum/profiles/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error("Failed to get forum profile:", error);
    throw error;
  }
};

// Update my forum profile
export const updateMyForumProfile = async (data: Partial<ForumProfile>) => {
  try {
    const response = await api.put<ApiResponse<ForumProfile>>('/forum/profiles/me', data);
    return response.data.data;
  } catch (error) {
    console.error("Failed to update forum profile:", error);
    throw error;
  }
};

// Get forum leaderboard
export const getForumLeaderboard = async (params?: {
  type?: 'reputation' | 'posts' | 'topics';
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await api.get<ApiResponse<{
      profiles: Array<{
        _id: string;
        user: UserProfile;
        signature?: string;
        title?: string;
        location?: string;
        postCount: number;
        topicCount: number;
        reputation: number;
        lastSeen: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>>('/forum/profiles/leaderboard', { params });
    return response.data.data;
  } catch (error) {
    console.error("Failed to get forum leaderboard:", error);
    throw error;
  }
};

// Get forum stats
export const getForumStats = async () => {
  try {
    const response = await api.get<ApiResponse<{
      overview: {
        categories: number;
        topics: number;
        posts: number;
        users: number;
        activeUsers: number;
      };
      trendingTopics: ForumTopic[];
      topContributors: Array<{
        user: { username: string };
        reputation: number;
        postCount: number;
        topicCount: number;
      }>;
    }>>('/forum/stats');
    return response.data.data;
  } catch (error) {
    console.error("Failed to get forum stats:", error);
    throw error;
  }
};