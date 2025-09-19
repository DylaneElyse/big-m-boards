"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children, fallback = null }) => {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we've initialized and there's no user
    if (initialized && !loading && !user) {
      router.push('/login');
    }
  }, [user, loading, initialized, router]);

  // Show loading state while checking authentication
  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If not authenticated, show fallback or nothing (redirect will happen)
  if (!user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
