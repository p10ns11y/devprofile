import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { XSearchCard } from "@/components/x/XSearchCard";
import { generateXSearchIntervals } from "@/lib/x-search/intervals";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Posts on X - Peramanathan Sathyamoorthy",
  description: "Browse posts on X in 8-day windows — search archives from December 2024 to today.",
};

export default function XSearchPage() {
  const intervals = generateXSearchIntervals();

  return (
    <div className="min-h-screen bg-surface1 text-text1">
      <Header />

      <div className="container mx-auto px-6 pb-16 pt-24">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-bold text-text1">Posts on X</h1>
          <p className="text-lg text-text2">
            X search results are limited by scroll and pagination. Each card opens an 8-day window
            of English posts from <span className="font-medium text-text1">@peramanathan</span>,
            from December 2024 through today.
          </p>
          <p className="mt-3 text-sm text-text2">{intervals.length} periods</p>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {intervals.map((interval) => (
            <XSearchCard key={`${interval.since}-${interval.until}`} interval={interval} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
