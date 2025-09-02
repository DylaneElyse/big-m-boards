import AdminHeader from '@/components/AdminHeader';
import AdminFooter from '@/components/AdminFooter';

export default function AdminLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50"> 
      <AdminHeader />
      <div className='flex-grow'>
        {children}
      </div>
      <AdminFooter />
    </div>
  );
}