import Link from "next/link";
import type { ComponentProps, MouseEventHandler, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

type SiteButtonVariant = "primary" | "secondary" | "outline";
type SiteButtonSize = "default" | "lg";

const variantMap: Record<SiteButtonVariant, ComponentProps<typeof Button>["variant"]> = {
  primary: "default",
  secondary: "secondary",
  outline: "outline",
};

const sizeClasses: Record<SiteButtonSize, string> = {
  default: "",
  lg: "h-auto min-h-11 rounded-lg px-6 py-3 text-base font-medium",
};

const variantClasses: Record<SiteButtonVariant, string> = {
  primary: "bg-brand text-accent-primary-text hover:bg-brand/90 border-transparent",
  secondary:
    "bg-surface-raised text-text1 border border-(--color-border-subtle) shadow-(--marketing-shadow-sm) hover:bg-surface3 hover:border-[color-mix(in_oklch,var(--color-brand-emphasis)_25%,var(--color-border-subtle))]",
  outline:
    "border-(--color-border-subtle) bg-transparent text-text1 hover:bg-surface2 hover:border-[color-mix(in_oklch,var(--color-brand-emphasis)_25%,var(--color-border-subtle))]",
};

type SiteButtonProps = {
  variant?: SiteButtonVariant;
  size?: SiteButtonSize;
  fullWidth?: boolean;
  href?: string;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<typeof Button>, "variant" | "asChild" | "size">;

export function SiteButton({
  variant = "primary",
  size = "default",
  fullWidth = false,
  href,
  children,
  className,
  ...props
}: SiteButtonProps) {
  const buttonVariant = variantMap[variant];
  const mergedClass = cn(
    sizeClasses[size],
    variantClasses[variant],
    fullWidth && "w-full sm:w-auto",
    className
  );

  if (href) {
    const isExternal =
      href.startsWith("http") || href.startsWith("/api/") || /\.pdf(?:$|[?#])/i.test(href);
    const { onClick, ...buttonProps } = props;
    const linkClick = onClick as MouseEventHandler<HTMLAnchorElement> | undefined;
    return (
      <Button asChild variant={buttonVariant} className={mergedClass} {...buttonProps}>
        {isExternal ? (
          <a href={href} target="_blank" rel="nofollow noreferrer noopener" onClick={linkClick}>
            {children}
          </a>
        ) : (
          <Link href={href} onClick={linkClick}>
            {children}
          </Link>
        )}
      </Button>
    );
  }

  return (
    <Button variant={buttonVariant} className={mergedClass} {...props}>
      {children}
    </Button>
  );
}
