import Link from 'next/link';
import React from 'react';

const Header = () => {
    return (
        <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-50">
            <Link href="/" className="flex items-center text-2xl font-bold text-gray-800 hover:opacity-80">
                {/* Replace with your logo image if needed */}
                <span>MyLogo</span>
            </Link>
            <button className="px-5 py-2 rounded bg-blue-600 text-white text-base font-medium hover:bg-blue-700 transition">
                Login
            </button>
        </header>
    );
};

export default Header;
