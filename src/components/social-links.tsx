import { Icon, type IconName } from "@/components/icon";
import cvdata from "../data/cvdata.json";

export function SocialLinks() {
  return (
    <nav aria-label="Social" className="flex items-center justify-center gap-4">
      {cvdata.social_links.map((social) => (
        <a
          key={social.label}
          href={social.href}
          className="p-3 rounded-full border border-[var(--color-border-subtle)] bg-surface1 hover:bg-surface2 hover:text-[var(--color-link)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-emphasis)]"
          aria-label={social.label}
          target="_blank"
          rel="nofollow noreferrer noopener"
        >
          <Icon name={social.icon as IconName} className="w-5 h-5" aria-hidden="true" />
        </a>
      ))}
    </nav>
  );
}
