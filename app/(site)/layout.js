import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function SiteLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SiteHeader />
      <div className='flex-grow'>
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}