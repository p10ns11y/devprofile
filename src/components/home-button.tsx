import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';

interface HomeButtonProps {
  className?: string;
}

export function HomeButton({ className = "flex items-center space-x-2 px-3 py-2 bg-accent-primary text-text1 rounded-lg hover:bg-accent-primary/80 transition-all duration-200 text-sm font-medium" }: HomeButtonProps) {
  return (
    <Link href="/">
      <button className={className}>
        <Home className="w-4 h-4" />
        <span>Home</span>
      </button>
    </Link>
  );
}