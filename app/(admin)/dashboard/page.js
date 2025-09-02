"use client"

import Link from "next/link";

export default function Dashboard() {
  return (
    <main>
      <Link href="/listings/create">
        Add New Listing
      </Link>
      <Link href="/listings">
        View All Listings
      </Link>
    </main>
  );
}
