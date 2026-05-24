import { ArrowUpRight } from "lucide-react";
import { cn } from "@/components/ui/utils";
import type { XSearchInterval } from "@/lib/x-search/intervals";

interface XSearchFilterLinksProps {
  interval: Pick<XSearchInterval, "label" | "urlTop" | "urlLive">;
  compact?: boolean;
}

export function XSearchFilterLinks({ interval, compact = false }: XSearchFilterLinksProps) {
  const linkClassName = cn(
    "inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-border/30 bg-surface3 font-medium text-text1 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:bg-brand/10 hover:text-brand hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface2",
    compact ? "px-2 py-1.5 text-xs" : "gap-1.5 px-3 py-2 text-sm"
  );

  return (
    <div className="flex gap-2">
      <a
        href={interval.urlTop}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Search top posts from ${interval.label} on X`}
        className={linkClassName}
      >
        Top
        <ArrowUpRight className={cn(compact ? "h-3 w-3" : "h-3.5 w-3.5")} aria-hidden="true" />
      </a>
      <a
        href={interval.urlLive}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Search latest posts from ${interval.label} on X`}
        className={linkClassName}
      >
        Live
        <ArrowUpRight className={cn(compact ? "h-3 w-3" : "h-3.5 w-3.5")} aria-hidden="true" />
      </a>
    </div>
  );
}
