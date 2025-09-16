"use client";

import { motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';

import cvdata from '../data/cvdata.json'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = [
    { name: 'Home', href: '/#home' },
    { name: 'About', href: '/#about' },
    { name: 'CV', href: '/cv' },
    // { name: 'Skills', href: '/#skills' },
    { name: 'Projects', href: '/#projects' },
    { name: 'Experience', href: '/#experience' },
    { name: 'Content Hub', href: '/content-hub' },
    // { name: 'Contact', href: '/#contact' }, // Testing sw cache busting
  ];

  const scrollToSection = (href: string) => {
    // Check if we're currently on home page
    const isHomePage = window.location.pathname === '/';

    if (href.startsWith('/#')) {
      // Anchor link - if not on home page, navigate there first
      if (!isHomePage) {
        const homeUrl = `${window.location.origin}${href}`;
        window.location.href = homeUrl;
        return;
      }

      // On home page - smooth scroll to section
      const element = document.querySelector(href.slice(1));
      element?.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false); // Close menu after navigation
      return;
    }

    // Regular navigation for non-anchor links (handled by Link now)
    // No need for special cases
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b"
    >
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05, cursor: 'pointer' }}
          className="text-xl font-semibold"
          onClick={() => scrollToSection('/')}
        >
          {cvdata.name_with_initial}
        </motion.div>

        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {item.href.startsWith('/#') ? (
                <motion.button
                  whileHover={{ scale: 1.1, color: 'var(--primary)', cursor: 'pointer' }}
                  onClick={() => scrollToSection(item.href)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.name}
                </motion.button>
              ) : (
                <Link href={item.href} prefetch target={item.href === '/cv/web-view' ? '_blank' : '_self'}>
                  <motion.span
                    whileHover={{ scale: 1.1, color: 'var(--primary)', cursor: 'pointer' }}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </motion.span>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden ml-auto"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Button
            variant="outline"
            onClick={() => scrollToSection('/#contact')}
            className="hidden md:inline-flex"
          >
            Let's Talk
          </Button>
        </motion.div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-background/95 backdrop-blur-md border-t"
        >
          <div className="container mx-auto px-6 py-4 space-y-4">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {item.href.startsWith('/#') ? (
                  <button
                    onClick={() => scrollToSection(item.href)}
                    className="block w-full text-left text-muted-foreground hover:text-primary transition-colors py-2"
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link href={item.href} prefetch target={item.href === '/cv/web-view' ? '_blank' : '_self'}>
                    <span
                      onClick={() => setIsMenuOpen(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setIsMenuOpen(false);
                        }
                      }}
                      tabIndex={0}
                      className="block w-full text-left text-muted-foreground hover:text-primary transition-colors py-2"
                    >
                      {item.name}
                    </span>
                  </Link>
                )}
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: navItems.length * 0.1 }}
            >
              <Button
                variant="outline"
                onClick={() => {
                  scrollToSection('/#contact');
                  setIsMenuOpen(false);
                }}
                className="w-full"
              >
                Let's Talk
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
