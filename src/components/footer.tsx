"use client";

import Link from "next/link";
import cvdata from "../data/cvdata.json";
import { SocialLinks } from "./social-links";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface2 py-12">
      <div className="container mx-auto min-w-0 max-w-7xl px-4 sm:px-6 text-center space-y-8">
        <p className="text-2xl font-semibold font-[family-name:var(--font-display)] text-text1">
          {cvdata.name_with_initial}
        </p>

        <SocialLinks />

        <nav
          aria-label="Footer"
          className="flex items-center justify-center gap-6 flex-wrap text-sm"
        >
          <Link href="/cv" className="text-text1 hover:text-brand transition-colors">
            CV
          </Link>
          <Link href="/certificates" className="text-text1 hover:text-brand transition-colors">
            Certificates
          </Link>
          <Link href="/qa" className="text-text1 hover:text-brand transition-colors">
            Profile Q&amp;A
          </Link>
          <a href="/api/cv/download" className="text-text1 hover:text-brand transition-colors">
            Download PDF
          </a>
        </nav>

        <p className="text-sm text-text2">
          © {currentYear} {cvdata.name}. Built with Next.js and Tailwind CSS.
        </p>
      </div>
    </footer>
  );
}
