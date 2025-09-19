// /app/listings/[slug]/page.js

import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getListingBySlug } from '@/lib/supabase/api';

// This line is important for dynamic pages using server functions
export const dynamic = 'force-dynamic';

// Generate dynamic metadata for the browser tab
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const listing = await getListingBySlug(supabase, slug);

  if (!listing) {
    return { title: 'Listing Not Found' };
  }
  return {
    title: listing.title,
    description: listing.description,
  };
}


export default async function PublicListingDetailPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const listing = await getListingBySlug(supabase, slug);

  // THIS IS THE CRITICAL SAFETY CHECK:
  // If the database returns no listing, show the 404 page.
  if (!listing) {
    notFound();
  }

  const creationDate = new Date(listing.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link 
          href="/listings"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          &larr; Back to all listings
        </Link>
      </div>

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
              No Image
            </div>
          )}
        </div>
        
        {/* Details Section */}
        <div className="flex flex-col gap-y-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {listing.title}
          </h1>

          <div>
            <h2 className="text-sm font-medium text-gray-500">Status</h2>
            <span className={`mt-1 inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                   listing.is_available 
                     ? 'bg-green-100 text-green-800' 
                     : 'bg-red-100 text-red-800'
                 }`}
            >
              {listing.is_available ? 'Available' : 'Unavailable'}
            </span>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500">Description</h2>
            <p className="mt-1 text-base text-gray-800 whitespace-pre-wrap">
                {listing.description || 'No description provided.'}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}