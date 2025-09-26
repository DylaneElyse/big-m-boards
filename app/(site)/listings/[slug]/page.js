import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getListingBySlug } from '@/lib/supabase/api';
import ImageGallery from '@/components/ImageGallery';
import ContactButton from '@/components/ContactButton';

export const dynamic = 'force-dynamic';

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

  if (!listing) {
    notFound();
  }

  const creationDate = new Date(listing.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
      {/* Mobile-optimized header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 touch-target"
        >
          &larr; Back to all listings
        </Link>
        {/* Contact Button - Hidden on mobile, shown in details section instead */}
        <div className="hidden sm:block">
          <ContactButton size="default" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
        {/* Image Section */}
        <div className="w-full">
          <ImageGallery 
            images={listing.image_urls ? JSON.parse(JSON.stringify(listing.image_urls)) : []} 
            altText={listing.title} 
          />
        </div>
        
        {/* Details Section */}
        <div className="flex flex-col gap-y-4 sm:gap-y-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
            {listing.title}
          </h1>

          {/* Mobile-first status and price row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div>
              <h2 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Status</h2>
              <span className={`inline-block px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full ${
                    listing.is_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
              >
                {listing.is_available ? 'Available' : 'Sold'}
              </span>
            </div>

            {/* Price Section */}
            {listing.price && (
              <div>
                <h2 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Price</h2>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  ${parseFloat(listing.price).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Description</h2>
            <p className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap leading-relaxed">
                {listing.description || 'No description provided.'}
            </p>
          </div>

          {/* Contact Section - Always visible */}
          <div className="pt-4 border-t border-gray-200">
            {!listing.is_available && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                <p className="text-sm text-orange-800 font-medium text-center">
                  Unfortunately this is no longer available. Contact me for something similar!
                </p>
              </div>
            )}
            <ContactButton size="large" className="w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
