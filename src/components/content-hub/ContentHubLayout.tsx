'use client';

import React from 'react';
import Link from 'next/link';
import { SearchBar } from './SearchBar';

interface ContentHubLayoutProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  currentPage: string;
}

export function ContentHubLayout({ searchTerm, onSearchChange, currentPage }: ContentHubLayoutProps) {
  const navItems = [
      { name: 'Briefs', href: '/content-hub/briefs', key: 'briefs' },
      { name: 'Writeups', href: '/content-hub/writeups', key: 'writeups' },
      { name: 'Readings', href: '/content-hub/readings', key: 'readings' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="mb-4 text-center">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm font-medium">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L2 12.414V19a1 1 0 001 1h3a1 1 0 001-1v-3a1 1 0 011-1h2a1 1 0 011 1v3a1 1 0 001 1h3a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-9-9z"/>
            </svg>
            Home
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-center">Content Hub</h1>
        <nav className="flex justify-center mb-6" role="navigation" aria-label="Content Hub Navigation">
          <ul className="flex space-x-4">
            {navItems.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    currentPage === item.key
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-300'
                  }`}
                  aria-current={currentPage === item.key ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex justify-center">
          <SearchBar value={searchTerm} onChange={onSearchChange} />
        </div>
      </header>
    </div>
  );
}
