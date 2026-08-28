import type { Metadata } from "next";
import type { ReactNode } from "react";

const title = "Archive is not memory — the second constraint on agent recall";
const description =
  "What is allowed to become a snippet at all? Reuse, not form, is the admissions rule for agent memory—and why both biology and harnesses invent when the filter has no reject gate.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "agent memory",
    "archive vs memory",
    "memory admissions",
    "agent recall",
    "truthfulness",
    "provenance",
    "pulse instead of dump",
    "context window",
    "hallucination",
    "intelligence architectonics",
    "Peramanathan Sathyamoorthy",
  ],
  authors: [{ name: "Peramanathan Sathyamoorthy", url: "https://x.com/peramanathan" }],
  creator: "Peramanathan Sathyamoorthy",
  category: "Technology",
  alternates: {
    canonical: "/focus/memory-issue/archive-not-memory",
  },
  openGraph: {
    title,
    description,
    url: "/focus/memory-issue/archive-not-memory",
    siteName: "Peramanathan Sathyamoorthy",
    locale: "en_US",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@peramanathan",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ArchiveNotMemoryLayout({ children }: { children: ReactNode }) {
  return children;
}
