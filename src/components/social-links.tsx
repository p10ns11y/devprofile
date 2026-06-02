import { Icon, type IconName } from "@/components/icon";
import { cn } from "@/components/ui/utils";
import cvdata from "../data/cvdata.json";

type SocialLinksProps = {
  className?: string;
  size?: "default" | "compact";
};

export function SocialLinks({ className, size = "default" }: SocialLinksProps) {
  const compact = size === "compact";

  return (
    <nav
      aria-label="Profile links"
      className={cn(
        "mx-auto flex w-fit items-center justify-center",
        compact ? "gap-2" : "gap-3 sm:gap-4",
        className
      )}
    >
      {cvdata.social_links.map((social) => (
        <a
          key={social.label}
          href={social.href}
          className={cn(
            "inline-flex items-center justify-center rounded-full border border-(--color-border-subtle) bg-surface1 text-text1 transition-colors hover:bg-surface2 hover:text-(--color-link) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand-emphasis)",
            compact ? "size-9" : "p-3"
          )}
          aria-label={social.label}
          target="_blank"
          rel="nofollow noreferrer noopener"
        >
          <Icon
            name={social.icon as IconName}
            className={compact ? "size-4" : "size-5"}
            aria-hidden="true"
          />
        </a>
      ))}
    </nav>
  );
}
