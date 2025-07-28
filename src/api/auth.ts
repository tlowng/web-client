// src/api/auth.ts
import api from './client';
import type { UserData, AuthResponse, UserProfile, LoginCredentials, RegisterCredentials } from '@/types';

export const registerUser = (userData: RegisterCredentials): Promise<{ message: string }> => 
  api.post('/auth/signup', userData).then(res => res.data);
  
export const loginUser = (credentials: LoginCredentials): Promise<{ token: string }> => 
  api.post('/auth/login', credentials).then(res => res.data);
  
export const getMe = (): Promise<UserProfile> => 
  api.get('/auth/me').then(res => res.data);
