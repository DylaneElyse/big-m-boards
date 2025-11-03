"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function BackButton() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/admin/listings';

  return (
    <Link 
      href={returnTo}
      className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
      </svg>
      Back to all listings
    </Link>
  );
}
