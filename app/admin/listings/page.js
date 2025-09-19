import Link from 'next/link';
import Image from 'next/image';
import { getAllListings } from '@/lib/supabase/api';

export default async function ListingsPage() {
  const listings = await getAllListings();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center border-b border-gray-200 pb-6 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
          All Listings
        </h1>
        <Link 
          href="/admin/listings/create" 
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          + Create New Listing
        </Link>
      </div>

      {!listings || listings.length === 0 ? (
        <div className="text-center py-16">
            <h3 className="text-lg font-medium text-gray-900">No listings found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new listing.
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6">
          {listings.map((listing) => (
            <Link 
              href={`/admin/listings/${listing.slug}`} 
              key={listing.id} 
              className="group block border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200"
            >
              <div className="relative w-full h-48 bg-gray-200">
                {listing.image_urls && listing.image_urls.length > 0 ? (
                  <Image
                    src={listing.image_urls[0]}
                    alt={listing.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center group-hover:opacity-75 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {listing.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3 flex-grow">
                    {listing.description}
                </p>
                <div className="mt-4">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                    listing.is_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {listing.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

export const metadata = {
  title: 'All Listings',
  description: 'Browse all available listings.',
};