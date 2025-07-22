// src/utils/ui-helpers.tsx - FIXED VERSION
import { Trophy, Medal, Award } from 'lucide-react';

export const getDifficultyVariant = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'hard':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'text-green-600';
    case 'medium':
      return 'text-yellow-600';
    case 'hard':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const getRankIcon = (index: number) => {
  switch (index) {
    case 0:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 1:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 2:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>;
  }
};

export const getRankBadgeVariant = (index: number) => {
  switch (index) {
    case 0:
      return 'default'; // Gold
    case 1:
      return 'secondary'; // Silver
    case 2:
      return 'outline'; // Bronze
    default:
      return 'outline';
  }
};

// Fixed: Accept profile object with title and reputation
export const getUserTitle = (profile: { title?: string; reputation: number }) => {
  if (profile.title) return profile.title;
  
  // Auto-generate title based on reputation
  if (profile.reputation >= 5000) return 'Forum Legend';
  if (profile.reputation >= 2000) return 'Expert Contributor';
  if (profile.reputation >= 1000) return 'Senior Member';
  if (profile.reputation >= 500) return 'Active Member';
  if (profile.reputation >= 100) return 'Regular Member';
  return 'New Member';
};

export const formatLastSeen = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

export const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const getActivityLevel = (count: number) => {
  if (count >= 100) return { level: 'Very High', color: 'text-red-500', bg: 'bg-red-100' };
  if (count >= 50) return { level: 'High', color: 'text-orange-500', bg: 'bg-orange-100' };
  if (count >= 25) return { level: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-100' };
  if (count >= 10) return { level: 'Low', color: 'text-green-500', bg: 'bg-green-100' };
  return { level: 'Very Low', color: 'text-gray-500', bg: 'bg-gray-100' };
};

export const calculateEngagementRate = (stats: { overview: { posts: number; topics: number; users: number; } } | null) => {
  if (!stats) return '0';
  const { posts, topics, users } = stats.overview;
  return users > 0 ? ((posts + topics) / users).toFixed(1) : '0';
};