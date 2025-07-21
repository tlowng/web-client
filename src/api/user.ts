// src/api/user.ts
import api from './client';
import type { UserProfile } from '@/types';

export const getMe = () => api.get<UserProfile>('/auth/me').then(res => res.data);
