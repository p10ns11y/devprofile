"use client";

import { motion } from 'motion/react';
import Link from 'next/link';
import { Button } from './ui/button';

import cvdata from '../data/cvdata.json'

export function Header() {
  const navItems = [
    { name: 'Home', href: '/#home' },
    { name: 'About', href: '/#about' },
    { name: 'CV', href: '/cv/web-view' },
    { name: 'Skills', href: '/#skills' },
    { name: 'Projects', href: '/#projects' },
    { name: 'Experience', href: '/#experience' },
    { name: 'Content Hub', href: '/content-hub' },
    { name: 'Contact', href: '/#contact' },
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
    </motion.header>
  );
}
