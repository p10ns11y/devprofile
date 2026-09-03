import type { Metadata } from "next";
import type { ReactNode } from "react";

const title = "Pulse instead of dump — Schrödinger’s constraints on agent memory";
const description =
  "Why agent memory should pulse instead of dump: Schrödinger’s three constraints, mapped onto the intelligence stack, and a surgical contract between runtime and memory.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "agent memory",
    "context window",
    "pulsive memory",
    "Schrödinger",
    "aperiodic crystal",
    "token efficiency",
    "Key Decision Indicators",
    "intelligence architectonics",
    "Peramanathan Sathyamoorthy",
  ],
  authors: [{ name: "Peramanathan Sathyamoorthy", url: "https://x.com/peramanathan" }],
  creator: "Peramanathan Sathyamoorthy",
  category: "Technology",
  alternates: {
    canonical: "/articles/memory-issue",
  },
  openGraph: {
    title,
    description,
    url: "/articles/memory-issue",
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

export default function MemoryIssueLayout({ children }: { children: ReactNode }) {
  return children;
}
