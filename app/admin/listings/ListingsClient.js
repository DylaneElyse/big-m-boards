"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ListingsClient({ initialData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [listings, setListings] = useState(initialData.listings);
  const [pagination, setPagination] = useState(initialData.pagination);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const loadingRef = useRef(false);
  const initialParamsRef = useRef({
    page: initialData.pagination.currentPage,
    sort: 'created_at',
    order: 'desc',
    filter: 'all'
  });
  
  // Get current filters from URL
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const currentSort = searchParams.get('sort') || 'created_at';
  const currentOrder = searchParams.get('order') || 'desc';
  const currentFilter = searchParams.get('filter') || 'all';

  const sortOptions = [
    { value: 'created_at', label: 'Date Created', orders: ['desc', 'asc'] },
    { value: 'title', label: 'Title', orders: ['asc', 'desc'] },
    { value: 'price', label: 'Price', orders: ['asc', 'desc'] },
    { value: 'is_available', label: 'Availability', orders: ['desc', 'asc'] }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Listings' },
    { value: 'available', label: 'Available Only' },
    { value: 'sold', label: 'Sold Only' }
  ];

  const updateURL = (params) => {
    const newParams = new URLSearchParams();
    
    // Always set page parameter explicitly
    newParams.set('page', params.page || currentPage.toString());
    
    // Always include sort parameter
    if (params.sort) {
      newParams.set('sort', params.sort);
    }
    
    // Always include order parameter
    if (params.order) {
      newParams.set('order', params.order);
    }
    
    if (params.filter && params.filter !== 'all') {
      newParams.set('filter', params.filter);
    }
    
    const newURL = `/admin/listings?${newParams.toString()}`;
    router.push(newURL);
  };

  const handleSortChange = (sortBy) => {
    const currentSortOption = sortOptions.find(opt => opt.value === sortBy);
    const newOrder = currentSort === sortBy && currentOrder === currentSortOption.orders[0] 
      ? currentSortOption.orders[1] 
      : currentSortOption.orders[0];
    
    updateURL({ 
      sort: sortBy, 
      order: newOrder, 
      filter: currentFilter,
      page: '1' // Reset to first page when sorting
    });
  };

  const handleFilterChange = (filter) => {
    updateURL({ 
      sort: currentSort, 
      order: currentOrder, 
      filter: filter,
      page: '1' // Reset to first page when filtering
    });
  };

  const handlePageChange = (page) => {
    console.log('=== ADMIN PAGINATION DEBUG ===');
    console.log('Requested page:', page);
    console.log('Current page:', currentPage);
    console.log('Total pages:', pagination.totalPages);
    console.log('Has prev page:', pagination.hasPrevPage);
    console.log('Has next page:', pagination.hasNextPage);
    
    // Ensure page is within valid range
    const validPage = Math.max(1, Math.min(page, pagination.totalPages));
    console.log('Valid page calculated:', validPage);
    
    // Simple approach - just use window.location
    const params = new URLSearchParams(window.location.search);
    params.set('page', validPage.toString());
    
    if (currentSort !== 'created_at') {
      params.set('sort', currentSort);
    } else {
      params.delete('sort');
    }
    
    if (currentOrder !== 'desc') {
      params.set('order', currentOrder);
    } else {
      params.delete('order');
    }
    
    if (currentFilter !== 'all') {
      params.set('filter', currentFilter);
    } else {
      params.delete('filter');
    }
    
    const newURL = `${window.location.pathname}?${params.toString()}`;
    console.log('Navigating to:', newURL);
    
    // Use window.location instead of router
    window.location.href = newURL;
  };

  // Fetch data when URL parameters change
  useEffect(() => {
    const fetchListings = async () => {
      if (loadingRef.current) return;
      
      loadingRef.current = true;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          sortBy: currentSort,
          sortOrder: currentOrder,
          availabilityFilter: currentFilter
        });

        const response = await fetch(`/api/listings?${params}`);
        const data = await response.json();
        
        if (data.success) {
          setListings(data.listings);
          setPagination(data.pagination);
          // Update the initialParamsRef after successful fetch
          initialParamsRef.current = {
            page: currentPage,
            sort: currentSort,
            order: currentOrder,
            filter: currentFilter
          };
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    };

    // Only fetch if parameters have changed from initial load
    const paramsChanged = 
      currentPage !== initialParamsRef.current.page ||
      currentSort !== initialParamsRef.current.sort ||
      currentOrder !== initialParamsRef.current.order ||
      currentFilter !== initialParamsRef.current.filter;

    if (paramsChanged) {
      fetchListings();
    }
  }, [currentPage, currentSort, currentOrder, currentFilter]);

  const getSortIcon = (sortBy) => {
    if (currentSort !== sortBy) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return currentOrder === 'asc' ? (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            All Listings
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {pagination.totalCount} total listings
          </p>
        </div>
        <Link 
          href="/admin/listings/create" 
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          + Create New Listing
        </Link>
      </div>

      {/* Mobile Compact Controls */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {sortOptions.find(opt => opt.value === currentSort)?.label} • {filterOptions.find(opt => opt.value === currentFilter)?.label}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v6.586a1 1 0 01-1.447.894l-4-2A1 1 0 018 18.586v-4.586a1 1 0 00-.293-.707L1.293 7.293A1 1 0 011 6.586V4z" />
            </svg>
            Sort & Filter
          </button>
        </div>
        
        {/* Collapsible Mobile Menu */}
        {showFilters && (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
            {/* Sort Controls */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Sort by:</h3>
              <div className="grid grid-cols-1 gap-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleSortChange(option.value);
                      setShowFilters(false);
                    }}
                    className={`inline-flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentSort === option.value
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>{option.label}</span>
                    {getSortIcon(option.value)}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Controls */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Filter:</h3>
              <div className="grid grid-cols-1 gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleFilterChange(option.value);
                      setShowFilters(false);
                    }}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
                      currentFilter === option.value
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Controls */}
      <div className="hidden sm:flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8">
        {/* Sort Controls */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 self-center">Sort by:</span>
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentSort === option.value
                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {option.label}
              {getSortIcon(option.value)}
            </button>
          ))}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 self-center">Filter:</span>
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleFilterChange(option.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentFilter === option.value
                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      )}

      {/* Listings Grid */}
      {!loading && (!listings || listings.length === 0) ? (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-gray-900">No listings found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {currentFilter !== 'all' || currentSort !== 'created_at' 
              ? 'Try adjusting your filters or search criteria.'
              : 'Get started by creating a new listing.'
            }
          </p>
        </div>
      ) : (
        <>
          <div className={`grid grid-cols-2 gap-y-6 gap-x-3 sm:gap-y-10 sm:gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${loading ? 'opacity-50' : ''}`}>
            {listings.map((listing) => (
              <Link 
                href={`/admin/listings/${listing.slug}`} 
                key={listing.id} 
                className={`group block border rounded-lg overflow-hidden shadow-sm transition-all duration-200 ${
                  listing.is_available 
                    ? 'border-gray-200 hover:shadow-lg' 
                    : 'border-gray-300 opacity-75 hover:opacity-90'
                }`}
              >
                <div className="relative w-full aspect-[3/4] bg-gray-200 rounded-t-lg overflow-hidden">
                  {listing.image_urls && listing.image_urls.length > 0 ? (
                    <Image
                      src={listing.image_urls[0]}
                      alt={listing.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className={`object-cover transition-all duration-200 ${
                        listing.is_available 
                          ? 'group-hover:opacity-75' 
                          : 'grayscale-[50%] group-hover:grayscale-[25%]'
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className={`text-lg font-semibold truncate ${
                    listing.is_available ? 'text-gray-800' : 'text-gray-500'
                  }`}>
                    {listing.title}
                  </h3>
                  {listing.price && (
                    <p className={`text-sm font-medium mt-1 ${
                      listing.is_available ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      ${listing.price}
                    </p>
                  )}
                  <p className={`mt-2 text-sm line-clamp-3 flex-grow ${
                    listing.is_available ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {listing.description}
                  </p>
                  <div className="mt-4">
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                      listing.is_available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {listing.is_available ? 'Available' : 'Sold'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {(pagination.currentPage - 1) * pagination.limit + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{pagination.totalCount}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === pagination.currentPage
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
