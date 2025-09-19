// /app/admin/listings/[slug]/page.js

import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getListingBySlug } from '@/lib/supabase/api';

// This line is critical to prevent build errors on dynamic routes
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const listing = await getListingBySlug(supabase, slug);

  // THE FIX (Part 1): Add the safety check to metadata generation
  if (!listing) {
    return { title: 'Listing Not Found' };
  }
  return {
    title: `Admin: ${listing.title}`,
  };
}

export default async function AdminListingDetailPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const listing = await getListingBySlug(supabase, slug);

  // THE FIX (Part 2): Add the critical safety check to the page component
  if (!listing) {
    notFound(); // This will immediately stop rendering and show the 404 page
  }

  // This code will now ONLY run if 'listing' is a valid object
  const creationDate = new Date(listing.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <div className="mb-6">
        <Link 
          href="/admin/listings"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to all listings
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex justify-between items-start gap-4 mb-8">
        <div>
            {/* This line will no longer error because `listing` is guaranteed to exist */}
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {listing.title}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
                Listing ID: <code className="bg-gray-100 p-1 rounded text-xs">{listing.id}</code>
            </p>
        </div>
        
        {/* Edit Button */}
        <Link
          href={`/admin/listings/edit/${listing.id}`} // Use the stable ID for the edit link
          className="flex-shrink-0 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Edit Listing
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Section */}
        <div className="relative aspect-square w-full rounded-lg overflow-hidden border">
           {listing.image_urls && listing.image_urls.length > 0 ? (
              <Image
                src={listing.image_urls[0]}
                alt={listing.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                No Image Provided
              </div>
            )}
        </div>
        
        {/* Details Section */}
        <div className="flex flex-col gap-y-6">
            <h2 className="text-sm font-medium text-gray-500">Status</h2>
            <span className={`mt-1 inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                   listing.is_available 
                     ? 'bg-green-100 text-green-800' 
                     : 'bg-red-100 text-red-800'
                 }`}
            >
              {listing.is_available ? 'Available' : 'Unavailable'}
            </span>
            <h2 className="text-sm font-medium text-gray-500">Description</h2>
            <p className="mt-1 text-base text-gray-800 whitespace-pre-wrap">
                {listing.description || 'No description provided.'}
            </p>
            <h2 className="text-sm font-medium text-gray-500">Date Created</h2>
            <p className="mt-1 text-base text-gray-800">{creationDate}</p>
            <h2 className="text-sm font-medium text-gray-500">Created By (User ID)</h2>
            <p className="mt-1 text-gray-600 font-mono text-sm">{listing.user_id}</p>
        </div>
      </div>
    </main>
  );
}