"use client"

import Link from "next/link";

export default function Dashboard() {
  return (
    <main>
      <Link href="/admin/listings/create">
        Add New Listing
      </Link>
      <Link href="/admin/listings">
        View All Listings
      </Link>
    </main>
  );
}
