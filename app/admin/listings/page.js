import { Suspense } from 'react';
import { getListingsPaginated } from '@/lib/supabase/api';
import ListingsClient from './ListingsClient';

export default async function ListingsPage({ searchParams }) {
  // Await searchParams before accessing its properties (Next.js 15 requirement)
  const params = await searchParams;
  
  // Get initial data based on URL parameters
  const page = parseInt(params?.page) || 1;
  const sortBy = params?.sort || 'created_at';
  const sortOrder = params?.order || 'desc';
  const availabilityFilter = params?.filter || 'all';

  const initialData = await getListingsPaginated({
    page,
    limit: 12,
    sortBy,
    sortOrder,
    availabilityFilter
  });

  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">Loading listings...</span>
        </div>
      </div>
    }>
      <ListingsClient initialData={initialData} />
    </Suspense>
  );
}

export const metadata = {
  title: 'All Listings',
  description: 'Browse all available listings.',
};
