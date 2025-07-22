// src/api/forum.ts
import api from './client';
import type { 
    ApiResponse, 
    ForumCategory, 
    ForumTopic, 
    ForumPost, 
    ForumTopicsResponse, 
    PostsResponse, 
    UserWithProfile, 
    ForumProfile,
    LeaderboardResponse,
    LeaderboardEntry,
    ForumProfilePopulated
} from '@/types';

export const getForumCategories = async () => {
    const response = await api.get<ApiResponse<ForumCategory[]>>("/forum/categories");
    console.log(">>> Full categories API response:", response);
    return response.data.data;
};

export const createForumCategory = async (data: Omit<ForumCategory, '_id' | 'slug' | 'topicCount' | 'postCount'>) => {
    const response = await api.post<ApiResponse<ForumCategory>>('/forum/categories', data);
    return response.data.data;
}

export const getCategoryBySlug = async (slug: string) => {
    const response = await api.get<ApiResponse<ForumCategory>>(`/forum/categories/${slug}`);
    return response.data.data;
};

export const getForumTopics = async (params?: {
  page?: number;
  limit?: number;
  sort?: string;
  category?: string;
}) => {
    const response = await api.get<ApiResponse<ForumTopicsResponse>>("/forum/topics", {
      params,
    });
    console.log(">>> Full topics API response:", response);
    return response.data.data.topics;
};

export const getTopicBySlug = async (slug: string) => {
    const response = await api.get<ApiResponse<ForumTopic>>(`/forum/topics/${slug}`);
    return response.data.data;
};

export const getPostsByTopic = async (topicId: string, params?: {
  page?: number;
  limit?: number;
}) => {
    const response = await api.get<ApiResponse<PostsResponse>>(`/forum/posts/topic/${topicId}`, {
      params,
    });
    return response.data.data.posts;
};

export const searchForumTopics = async (query: string, params?: {
  categoryId?: string;
  tags?: string;
  page?: number;
  limit?: number;
}) => {
    const searchParams = {
      q: query,
      ...params,
    };
    const response = await api.get<ApiResponse<ForumTopicsResponse>>(`/forum/topics/search`, {
      params: searchParams,
    });
    return response.data.data.topics;
};

export const createForumTopic = async (data: {
  title: string;
  content: string;
  categoryId: string;
  tags?: string[];
}) => {
    // Debug: Check token
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    console.log('Request data:', data);
    
    const response = await api.post<ApiResponse<ForumTopic>>('/forum/topics', data);
    return response.data;
};

export const createForumPost = async (data: {
  content: string;
  topicId: string;
  replyToPostId?: string;
}) => {
    const response = await api.post<ApiResponse<ForumPost>>('/forum/posts', data);
    return response.data;
};

export const likeForumPost = async (postId: string, type: string = 'like') => {
    const response = await api.post<ApiResponse<{
      message: string;
      liked: boolean;
      likeType: string | null;
    }>>(`/forum/posts/${postId}/like`, { type });
    return response.data;
};

export const deleteForumPost = async (postId: string) => {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/forum/posts/${postId}`);
    return response.data;
};

export const getForumProfile = async (userId: string) => {
    const response = await api.get<ApiResponse<UserWithProfile>>(`/forum/profiles/${userId}`);
    return response.data.data;
};

export const updateMyForumProfile = async (data: Partial<ForumProfile>) => {
    const response = await api.put<ApiResponse<ForumProfile>>('/forum/profiles/me', data);
    return response.data.data;
};

export const getForumLeaderboard = async (params?: {
  type?: 'reputation' | 'posts' | 'topics';
  page?: number;
  limit?: number;
}): Promise<LeaderboardResponse> => {
    const response = await api.get<ApiResponse<LeaderboardResponse>>(
      '/forum/profiles/leaderboard', 
      { params }
    );
    return response.data.data;
};

export const getForumStats = async () => {
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
};