"use client";

import { useAuth as useAuthContext } from '@/contexts/AuthContext';

export const useAuth = useAuthContext;

export const useRequireAuth = () => {
  const auth = useAuthContext();
  
  if (!auth.isAuthenticated) {
    throw new Error('User must be authenticated to access this resource');
  }
  
  return auth;
};

export const useAuthUser = () => {
  const { user, isAuthenticated } = useAuthContext();
  return { user, isAuthenticated };
};
