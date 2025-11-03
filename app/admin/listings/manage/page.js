import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getAllListings } from '@/lib/supabase/api';
import ManageListingsClient from './ManageListingsClient';

export default async function ManageListingsPage() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  try {
    const listings = await getAllListings();

    return <ManageListingsClient listings={listings} />;
  } catch (error) {
    console.error('Error loading listings:', error);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Error loading listings</h1>
          <p className="mt-2 text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }
}
