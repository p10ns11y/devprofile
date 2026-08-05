"use client";

import { ChevronDown, X as CloseIcon, Menu } from "lucide-react";
import { useReducedMotion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/components/ui/utils";
import cvdata from "../data/cvdata.json";
import { Icon, type IconName } from "./icon";
import { SiteButton } from "./site/SiteButton";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

type NavItem = {
  name: string;
  href: string;
  icon?: IconName;
  iconOnly?: boolean;
};

const primaryNav: NavItem[] = [
  { name: "About", href: "/#about" },
  { name: "Experience", href: "/#experience" },
];

const standaloneNav: NavItem[] = [
  { name: "Profile", href: "/profile" },
  { name: "CV", href: "/?cv=view" },
  { name: "Focus", href: "/focus" },
  { name: "Q&A", href: "/qa" },
  { name: "Posts on X", href: "/x", icon: "X", iconOnly: true },
];

const moreNav: NavItem[] = [
  { name: "Certificates", href: "/certificates" },
  { name: "Live GitHub", href: "/status/code/200" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isMoreOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMoreOpen(false);
    };

    const onPointerDown = (event: PointerEvent) => {
      const root = moreMenuRef.current;
      if (root && !root.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isMoreOpen]);

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

  const mobileNavItemClass =
    "flex w-full min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-center text-base text-text1 transition-colors hover:bg-surface2 hover:text-link focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand-emphasis)";

  const closeMobileMenu = useCallback(() => setIsMenuOpen(false), []);

  const renderAnchorItem = (item: NavItem, mobile = false) => (
    <button
      key={item.name}
      type="button"
      onClick={() => scrollToSection(item.href)}
      className={mobile ? mobileNavItemClass : `${navControlClass} py-2 md:py-0`}
    >
      {item.name}
    </button>
  );

  const renderLinkItem = (item: NavItem, onNavigate?: () => void, mobile = false) => (
    <Link
      key={item.name}
      href={item.href}
      prefetch
      onClick={onNavigate}
      className={mobile ? mobileNavItemClass : `${navControlClass} py-2 md:py-0`}
      aria-label={!mobile && item.iconOnly ? item.name : undefined}
      title={!mobile && item.iconOnly ? item.name : undefined}
    >
      {item.iconOnly ? (
        <span className={cn("inline-flex items-center gap-2", mobile && "justify-center")}>
          <Icon
            name={item.icon as IconName}
            className="size-4 shrink-0 fill-current"
            aria-hidden="true"
          />
          <span className={mobile ? undefined : "lg:sr-only"}>{item.name}</span>
        </span>
      ) : item.icon ? (
        <span className={cn("inline-flex items-center gap-2", mobile && "justify-center")}>
          <Icon name={item.icon} className="size-4 shrink-0 fill-current" aria-hidden="true" />
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
          href="/"
          className="min-w-0 max-w-[45vw] sm:max-w-none truncate text-md font-semibold text-text1 hover:text-[var(--color-link)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-emphasis)]"
        >
          {cvdata.name_with_initial}
        </Link>

        <div className="hidden lg:flex flex-1 min-w-0 items-center justify-center gap-4 xl:gap-6 text-[0.9em]">
          {primaryNav.map((item) => renderAnchorItem(item))}
          {standaloneNav.map((item) => renderLinkItem(item))}
          <div ref={moreMenuRef} className="relative">
            <button
              type="button"
              className={`${navControlClass} gap-1 py-0`}
              aria-expanded={isMoreOpen}
              aria-haspopup="menu"
              onClick={() => setIsMoreOpen((open) => !open)}
            >
              More
              <ChevronDown
                className={cn("size-4 transition-transform", isMoreOpen && "rotate-180")}
                aria-hidden="true"
              />
            </button>
            {isMoreOpen ? (
              <div
                role="menu"
                className="absolute top-full left-1/2 z-50 mt-3 flex min-w-[13rem] -translate-x-1/2 flex-col gap-1 rounded-xl border border-border bg-surface1 p-2 shadow-lg"
              >
                {moreNav.map((item) => (
                  <div key={item.name} role="none">
                    <Link
                      href={item.href}
                      prefetch
                      role="menuitem"
                      onClick={() => setIsMoreOpen(false)}
                      className={`${navControlClass} block w-full rounded-lg px-4 py-3 text-left`}
                    >
                      {item.name}
                    </Link>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
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
        className="lg:hidden border-t border-border bg-surface1/95 backdrop-blur-md"
      >
        <div className="site-container py-4">
          <ul className="flex flex-col gap-1" role="list">
            {primaryNav.map((item) => (
              <li key={item.name}>{renderAnchorItem(item, true)}</li>
            ))}
            {standaloneNav.map((item) => (
              <li key={item.name}>{renderLinkItem(item, closeMobileMenu, true)}</li>
            ))}
            {moreNav.map((item) => (
              <li key={item.name}>{renderLinkItem(item, closeMobileMenu, true)}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
            <SiteButton
              variant="outline"
              href="/#contact"
              className="w-full"
              onClick={closeMobileMenu}
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
