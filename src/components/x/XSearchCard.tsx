import { cn } from "@/components/ui/utils";
import { XSearchFilterLinks } from "@/components/x/XSearchFilterLinks";
import { getInclusiveEndDate, type XSearchInterval } from "@/lib/x-search/intervals";

interface XSearchCardProps {
  interval: XSearchInterval;
  isRecent?: boolean;
  compact?: boolean;
  className?: string;
}

export function XSearchCard({
  interval,
  isRecent = false,
  compact = false,
  className,
}: XSearchCardProps) {
  const inclusiveEnd = getInclusiveEndDate(interval.until);

  return (
    <article
      className={cn(
        "flex h-full min-h-0 flex-col justify-between rounded-lg border bg-surface2 rad-shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        compact ? "p-3" : "rounded-xl p-5 hover:shadow-lg",
        isRecent
          ? "border-brand/50 ring-1 ring-brand/20 hover:border-brand/60"
          : "border-border/20 hover:border-brand/30",
        className
      )}
    >
      <div>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "font-medium uppercase tracking-wider text-text2",
              compact ? "text-[0.65rem]" : "text-xs"
            )}
          >
            Period {interval.index}
          </span>
          {isRecent && (
            <span className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-brand">
              Recent
            </span>
          )}
        </div>
        <p
          className={cn(
            "font-semibold leading-snug text-text1",
            compact ? "mt-1.5 text-sm" : "mt-3 text-lg"
          )}
        >
          {interval.label}
        </p>
        <p className={cn("font-mono text-text2", compact ? "mt-1 text-[0.65rem]" : "mt-2 text-xs")}>
          {interval.since} – {inclusiveEnd}
        </p>
      </div>

      <div className={cn(compact ? "mt-2.5" : "mt-4")}>
        <XSearchFilterLinks interval={interval} compact={compact} />
      </div>
    </article>
  );
}
