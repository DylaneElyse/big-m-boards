import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getListingById } from '@/lib/supabase/api';
import EditListingForm from './EditListingForm';

export const dynamic = 'force-dynamic';

export default async function EditListingPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const listing = await getListingById(supabase, id);

  if (!listing) {
    notFound();
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-gray-200 pb-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Edit Listing
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Update the details for &quot;{listing.title}&quot;
        </p>
      </div>
      
      <EditListingForm listing={listing} />
    </main>
  );
}