import { XSearchCard } from "@/components/x/XSearchCard";
import type { PastIntervalSection } from "@/lib/x-search/sections";

interface XPastPeriodsProps {
  sections: PastIntervalSection[];
}

export function XPastPeriods({ sections }: XPastPeriodsProps) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto mt-12 max-w-7xl space-y-8">
      <h2 className="text-lg font-semibold text-text1">Past periods</h2>

      {sections.map((section) => (
        <section key={section.key} aria-labelledby={`past-${section.key}`}>
          <h3
            id={`past-${section.key}`}
            className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-text2"
          >
            {section.title}
          </h3>
          <div className="overflow-x-auto pb-1">
            <div className="mx-auto flex w-max max-w-full justify-center gap-3">
              {section.intervals.map((interval) => (
                <XSearchCard
                  key={`${interval.since}-${interval.until}`}
                  interval={interval}
                  compact
                  className="w-[11.5rem] shrink-0"
                />
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
