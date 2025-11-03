"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function BackButton() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';

  return (
    <Link 
      href={returnTo}
      className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 touch-target"
    >
      &larr; Back to all listings
    </Link>
  );
}
