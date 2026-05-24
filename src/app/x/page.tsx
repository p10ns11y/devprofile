import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { XDateRangePicker } from "@/components/x/XDateRangePicker";
import { XPastPeriods } from "@/components/x/XPastPeriods";
import { XSearchCard } from "@/components/x/XSearchCard";
import { generateXSearchIntervals } from "@/lib/x-search/intervals";
import { groupPastIntervalsByMonth, splitCurrentAndPastIntervals } from "@/lib/x-search/sections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Posts on X - Peramanathan Sathyamoorthy",
  description: "Browse posts on X in 8-day windows — search archives from December 2024 to today.",
};

export default function XSearchPage() {
  const intervals = generateXSearchIntervals();
  const { current, past } = splitCurrentAndPastIntervals(intervals);
  const pastSections = groupPastIntervalsByMonth(past);

  return (
    <div className="min-h-screen bg-surface1 text-text1">
      <Header />

      <div className="container mx-auto px-6 pb-16 pt-24">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h1 className="text-4xl font-bold text-text1">
            Posts on X of
            <span className="mt-1 block">@peramanathan</span>
          </h1>
          <p className="mt-4 text-lg text-text2">
            Browse top posts and live activity on X, eight days at a time.
          </p>
          <p className="mt-3 text-sm text-text2">{intervals.length} periods</p>
        </div>

        <div className="grid w-full grid-cols-1 items-stretch gap-4 lg:grid-cols-[1.618fr_1fr]">
          <XDateRangePicker className="h-full" />
          {current && (
            <XSearchCard interval={current} isRecent compact className="h-full min-h-0" />
          )}
        </div>

        <XPastPeriods sections={pastSections} />
      </div>

      <Footer />
    </div>
  );
}
