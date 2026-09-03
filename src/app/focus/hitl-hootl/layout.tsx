import type { Metadata } from "next";
import type { ReactNode } from "react";

const title = "HITL and HOOTL — automate the digital, surface the physical";
const description =
  "Human-in-the-loop is optional verification, not a play loop. Human-out-of-the-loop is a helper swarm clearing digital thrash along the critical path — the ensembly life OS thesis.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "human in the loop",
    "human out of the loop",
    "HITL",
    "HOOTL",
    "ensembly",
    "critical path",
    "agent swarm",
    "life operating system",
    "Peramanathan Sathyamoorthy",
  ],
  authors: [{ name: "Peramanathan Sathyamoorthy", url: "https://x.com/peramanathan" }],
  creator: "Peramanathan Sathyamoorthy",
  category: "Technology",
  alternates: {
    canonical: "/focus/hitl-hootl",
  },
  openGraph: {
    title,
    description,
    url: "/focus/hitl-hootl",
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

export default function HitlHootlLayout({ children }: { children: ReactNode }) {
  return children;
}
