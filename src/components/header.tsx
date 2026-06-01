"use client";

import { ChevronDown, X as CloseIcon, Menu } from "lucide-react";
import { useReducedMotion } from "motion/react";
import Link from "next/link";
import { useCallback, useState } from "react";
import cvdata from "../data/cvdata.json";
import { Icon, type IconName } from "./icon";
import { SiteButton } from "./site/SiteButton";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

type NavItem = {
  name: string;
  href: string;
  icon?: IconName;
};

const primaryNav: NavItem[] = [
  { name: "About", href: "/#about" },
  { name: "Experience", href: "/#experience" },
];

const standaloneNav: NavItem[] = [
  { name: "CV", href: "/cv" },
  { name: "Q&A", href: "/qa" },
];

const moreNav: NavItem[] = [
  { name: "Certificates", href: "/certificates" },
  { name: "Posts on X", href: "/x", icon: "X" },
  { name: "Live GitHub", href: "/status/code/200" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const scrollToSection = useCallback(
    (href: string) => {
      const isHomePage = window.location.pathname === "/";

      if (href.startsWith("/#")) {
        if (!isHomePage) {
          window.location.href = `${window.location.origin}${href}`;
          return;
        }
        document.querySelector(href.slice(1))?.scrollIntoView({
          behavior: shouldReduceMotion ? "auto" : "smooth",
        });
        setIsMenuOpen(false);
      }
    },
    [shouldReduceMotion]
  );

  const navControlClass =
    "inline-flex items-center leading-none text-text2 transition-colors hover:text-[var(--color-link)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-emphasis)]";

  const renderAnchorItem = (item: NavItem) => (
    <button
      key={item.name}
      type="button"
      onClick={() => scrollToSection(item.href)}
      className={`${navControlClass} py-2 md:py-0`}
    >
      {item.name}
    </button>
  );

  const renderLinkItem = (item: NavItem, onNavigate?: () => void) => (
    <Link
      key={item.name}
      href={item.href}
      prefetch
      onClick={onNavigate}
      className={`${navControlClass} py-2 md:py-0`}
      aria-label={item.icon ? item.name : undefined}
    >
      {item.icon ? (
        <span className="inline-flex items-center gap-1.5">
          <Icon name={item.icon} className="size-4 fill-current" aria-hidden="true" />
          {item.name}
        </span>
      ) : (
        item.name
      )}
    </Link>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface1/85 backdrop-blur-md border-b border-(--color-border-subtle) overflow-x-clip shadow-(--marketing-shadow-sm)">
      <nav aria-label="Primary" className="site-container flex items-center gap-3 py-4 sm:gap-4">
        <Link
          href="/#home"
          className="min-w-0 max-w-[45vw] sm:max-w-none truncate text-md font-semibold text-text1 hover:text-[var(--color-link)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-emphasis)]"
        >
          {cvdata.name_with_initial}
        </Link>

        <div className="hidden lg:flex flex-1 min-w-0 items-center justify-center gap-4 xl:gap-6 text-[0.9em]">
          {primaryNav.map(renderAnchorItem)}
          {standaloneNav.map((item) => renderLinkItem(item))}
          <details className="relative group">
            <summary className="list-none cursor-pointer inline-flex items-center gap-1 text-text2 hover:text-[var(--color-link)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-emphasis)] [&::-webkit-details-marker]:hidden">
              More
              <ChevronDown className="size-4" aria-hidden="true" />
            </summary>
            <div
              role="menu"
              className="absolute top-full left-0 mt-2 min-w-44 rounded-lg border border-border bg-surface1 p-2 shadow-lg"
            >
              {moreNav.map((item) => (
                <div key={item.name} role="none">
                  {renderLinkItem(item)}
                </div>
              ))}
            </div>
          </details>
        </div>

        <div className="hidden lg:flex items-center gap-3 ml-auto shrink-0">
          <ThemeToggle />
          <SiteButton variant="outline" href="/#contact">
            Let&apos;s Talk
          </SiteButton>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden ml-auto shrink-0"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-controls="site-nav-panel"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </nav>

      <nav
        id="site-nav-panel"
        aria-label="Mobile"
        data-state={isMenuOpen ? "open" : "closed"}
        className="lg:hidden bg-surface1/95 backdrop-blur-md border-t border-border/20"
      >
        <div className="container mx-auto px-6 py-4 space-y-1">
          {primaryNav.map(renderAnchorItem)}
          {standaloneNav.map((item) => renderLinkItem(item, () => setIsMenuOpen(false)))}
          {moreNav.map((item) => renderLinkItem(item, () => setIsMenuOpen(false)))}
          <div className="pt-4 border-t border-border/20 flex flex-col gap-3">
            <SiteButton
              variant="outline"
              href="/#contact"
              className="w-full"
              onClick={() => setIsMenuOpen(false)}
            >
              Let&apos;s Talk
            </SiteButton>
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
