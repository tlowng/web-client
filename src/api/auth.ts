// src/api/auth.ts
import api from './client';
import type { UserData } from '@/types';

export const registerUser = (userData: UserData) => api.post('/auth/signup', userData).then(res => res.data);
export const loginUser = (credentials: UserData) => api.post('/auth/login', credentials).then(res => res.data);
