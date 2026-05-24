"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/components/ui/utils";
import { XSearchFilterLinks } from "@/components/x/XSearchFilterLinks";
import {
  createIntervalFromStartDate,
  getInclusiveEndDate,
  X_SEARCH_START,
} from "@/lib/x-search/intervals";

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

interface XDateRangePickerProps {
  className?: string;
}

export function XDateRangePicker({ className }: XDateRangePickerProps) {
  const [startDate, setStartDate] = useState(X_SEARCH_START);
  const interval = createIntervalFromStartDate(startDate);
  const inclusiveEnd = interval ? getInclusiveEndDate(interval.until) : null;

  const handleStartChange = (value: string) => {
    if (value === "" || isoDatePattern.test(value) || /^\d{0,4}(-\d{0,2}){0,2}$/.test(value)) {
      setStartDate(value);
    }
  };

  const handleStartBlur = () => {
    if (!createIntervalFromStartDate(startDate)) {
      setStartDate(X_SEARCH_START);
    }
  };

  return (
    <section
      aria-labelledby="x-custom-window-heading"
      className={cn(
        "flex h-full min-h-0 flex-col rounded-lg border border-border/20 bg-surface2 p-4 rad-shadow transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md",
        className
      )}
    >
      <h2 id="x-custom-window-heading" className="text-base font-semibold text-text1">
        8-day window
      </h2>
      <p className="mt-1 mb-4 text-[0.65rem] leading-relaxed text-text2">
        8 days inclusive. X search until is the day after the last day.
      </p>

      <div className="flex flex-1 flex-col">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 text-left">
            <label htmlFor="x-start-date" className="text-xs font-medium text-text1">
              Start date
            </label>
            <Input
              id="x-start-date"
              type="text"
              inputMode="numeric"
              placeholder="YYYY-MM-DD"
              spellCheck={false}
              maxLength={10}
              className="h-8 font-mono text-xs"
              value={startDate}
              onChange={(event) => handleStartChange(event.target.value)}
              onBlur={handleStartBlur}
            />
          </div>

          <div className="space-y-1.5 text-left">
            <p className="text-xs font-medium text-text1">Last day</p>
            <div className="flex h-8 items-center rounded-md border border-border/30 bg-surface3 px-2.5 font-mono text-xs text-text1">
              {inclusiveEnd ?? "—"}
            </div>
            {interval && (
              <p className="text-[0.65rem] text-text2">
                {interval.label} · until {interval.until}
              </p>
            )}
          </div>
        </div>
      </div>

      {interval && (
        <div className="mt-auto pt-4">
          <XSearchFilterLinks interval={interval} compact />
        </div>
      )}
    </section>
  );
}
