import AdminHeader from '@/components/AdminHeader';
import AdminFooter from '@/components/AdminFooter';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

import Head from 'next/head';

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <>
          <Head>
            <link rel="icon" href="/app/favicon.ico" />
            <link rel="apple-touch-icon" sizes="180x180" href="/app/apple-icon.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/app/icon1.png" />
            <link rel="icon" type="image/svg+xml" href="/app/icon0.svg" />
            <link rel="manifest" href="/app/manifest.json" />
            <meta name="theme-color" content="#ffffff" />
          </Head>
          <div className="flex flex-col min-h-screen bg-gray-50"> 
            <AdminHeader />
            <div className='flex-grow'>
              {children}
            </div>
            <AdminFooter />
          </div>
        </>
      </ProtectedRoute>
    </AuthProvider>
  );
}
