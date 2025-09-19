import AdminHeader from '@/components/AdminHeader';
import AdminFooter from '@/components/AdminFooter';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="flex flex-col min-h-screen bg-gray-50"> 
          <AdminHeader />
          <div className='flex-grow'>
            {children}
          </div>
          <AdminFooter />
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}
