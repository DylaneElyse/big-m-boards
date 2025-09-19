import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

const Header = () => {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-50">
      <Link href="/admin/dashboard" className="flex items-center text-2xl font-bold text-gray-800 hover:opacity-80">
        <Image src="/bigmboards-logo.png" alt="Big M Boards Logo" width={200} height={80} />
      </Link>
      <Link href="/" className="px-5 py-2 rounded bg-blue-600 text-white text-base font-medium hover:bg-blue-700 transition">
        Logout
      </Link>
      </header>
  );
};

export default Header;
