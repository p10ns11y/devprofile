"use client";

import Link from "next/link";
import cvdata from "../data/cvdata.json";
import { SocialLinks } from "./social-links";

const siteLinks = [
  { href: "/?cv=view", label: "CV" },
  { href: "/certificates", label: "Certificates" },
  { href: "/qa", label: "Profile Q&A" },
  { href: "/status/code/200", label: "Live GitHub" },
  { href: "/api/cv/download", label: "Download PDF", external: true },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();
  const xHandle = cvdata.cv_social_links.x_handle;
  const xContent = cvdata.x_content;

  const xLinks = [
    { href: xContent.articles_url, label: "X Articles", external: true },
    { href: xContent.highlights_url, label: "X Highlights", external: true },
    { href: "/x", label: "X Posts (by date)" },
  ] as const;

  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="site-footer__inner">
          <div className="site-footer__main">
            <nav aria-label="Site" className="site-footer__nav site-footer__nav--explore">
              <p className="site-footer__nav-label">Explore</p>
              <ul role="list" className="site-footer__links">
                {siteLinks.map((link) => (
                  <li key={link.href}>
                    {"external" in link && link.external ? (
                      <a href={link.href} className="site-footer__link">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="site-footer__link">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <div className="site-footer__brand">
              <p className="site-footer__name">{cvdata.name_with_initial}</p>
              <p className="site-footer__role">{cvdata.latest_proffessional_role}</p>
              <p className="site-footer__location">{cvdata.home.current_location}</p>
              <SocialLinks
                size="compact"
                className="site-footer__social mx-0 w-full justify-center"
              />
            </div>

            <nav
              aria-label={`X profile for ${xHandle}`}
              className="site-footer__nav site-footer__nav--x"
            >
              <p className="site-footer__nav-label">{xHandle} on X</p>
              <ul role="list" className="site-footer__links">
                {xLinks.map((link) => (
                  <li key={link.href}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="nofollow noreferrer noopener"
                        className="site-footer__link"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="site-footer__link">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="site-footer__bottom">
            <p className="site-footer__copyright">
              © {currentYear} {cvdata.name}
            </p>
            <p className="site-footer__meta">Next.js · Tailwind CSS</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
