"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';
import ContactButton from './ContactButton';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const menuItems = [
        { href: '/', label: 'All Listings'},
        // { href: '/about', label: 'About'},
        { href: '/login', label: 'Admin Login'},
    ];

    return (
        <header className="flex items-center px-3 sm:px-6 lg:px-8 py-6 sm:py-6 bg-white border-b border-gray-200 sticky top-0 z-50">
            {/* Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center py-4">
                <Link href="/" className="flex items-center text-xl sm:text-2xl font-bold text-gray-800 hover:opacity-80 focus:outline-none">
                    <Image 
                        src="/horizontal-logo-red.png" 
                        alt="Big M Boards Logo" 
                        width={160} 
                        height={64}
                        className="sm:w-[200px] sm:h-[80px]"
                    />
                </Link>
            </div>

      {/* Menu Button */}
      <div className="ml-auto" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 touch-target"
          aria-expanded={isMenuOpen}
          aria-label="Open menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="fixed inset-x-0 top-[72px] bg-white shadow-lg border-t border-gray-200 z-40 sm:absolute sm:right-0 sm:left-auto sm:w-56 sm:mt-2 sm:rounded-md sm:ring-1 sm:ring-black sm:ring-opacity-5 sm:border-t-0">
            <div className="flex flex-col py-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-6 py-4 text-base text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors touch-target"
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-gray-100 my-2"></div>
              <div className="px-6 py-2">
                <ContactButton size="small" className="w-full" />
              </div>
            </div>
          </div>
        )}
            </div>
        </header>
    );
};

export default Header;
