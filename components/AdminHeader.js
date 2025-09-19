"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
      // The signOut function will handle the redirect
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Close menu when clicking outside
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
    { href: '/admin/dashboard', label: 'Dashboard'},
    { href: '/admin/listings', label: 'All Listings'},
    { href: '/admin/listings/create', label: 'Create Listing'},
    { href: '/', label: 'View Public Site', target: '_blank' },
  ];

  return (
    <header className="flex items-center px-3 sm:px-6 lg:px-8 py-6 sm:py-6 hover:cursor-pointer bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Logo - absolutely centered */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center py-4">
        <Link href="/admin/dashboard" className="flex items-center text-xl sm:text-2xl font-bold text-gray-800 hover:opacity-80 focus:outline-none">
          <Image 
            src="/bigmboards-logo.png" 
            alt="Big M Boards Logo" 
            width={160} 
            height={64}
            className="sm:w-[200px] sm:h-[80px]"
          />
        </Link>
      </div>

      {/* Menu Button - positioned on the right */}
      <div className="ml-auto" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 touch-target"
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
                  target={item.target}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-6 py-4 text-base text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors touch-target"
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-gray-100 my-2"></div>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                disabled={isLoggingOut}
                className="block w-full text-left px-6 py-4 text-base text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors disabled:opacity-50 touch-target"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
