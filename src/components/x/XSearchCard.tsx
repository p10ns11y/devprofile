import { ArrowUpRight } from "lucide-react";
import type { XSearchInterval } from "@/lib/x-search/intervals";

interface XSearchCardProps {
  interval: XSearchInterval;
}

const linkClassName =
  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border/30 bg-surface3 px-3 py-2 text-sm font-medium text-text1 transition-colors hover:border-brand/40 hover:bg-brand/10 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface2";

export function XSearchCard({ interval }: XSearchCardProps) {
  return (
    <article className="flex flex-col justify-between rounded-xl border border-border/20 bg-surface2 p-5 rad-shadow">
      <div>
        <span className="text-xs font-medium uppercase tracking-wider text-text2">
          Period {interval.index}
        </span>
        <p className="mt-3 text-lg font-semibold leading-snug text-text1">{interval.label}</p>
        <p className="mt-2 font-mono text-xs text-text2">{interval.since}</p>
      </div>

      <div className="mt-4 flex gap-2">
        <a
          href={interval.urlTop}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Search top posts from ${interval.label} on X`}
          className={linkClassName}
        >
          Top
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
        <a
          href={interval.urlLive}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Search latest posts from ${interval.label} on X`}
          className={linkClassName}
        >
          Live
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
