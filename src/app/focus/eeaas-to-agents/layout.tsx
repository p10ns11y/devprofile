import type { Metadata } from "next";
import type { ReactNode } from "react";

const title = "Focus — Make the learning loop more efficient";
const description =
  "From 2016 Energy Efficiency as a Service to 2026 agentic systems: why the cost of learning must fall while decision quality rises—and why that still holds even when nearly all inference is remote.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Energy Efficiency as a Service",
    "EEaaS",
    "agentic systems",
    "local-first AI",
    "Key Decision Indicators",
    "learning loop",
    "token efficiency",
    "on-device AI",
    "intelligence architectonics",
    "Peramanathan Sathyamoorthy",
  ],
  authors: [{ name: "Peramanathan Sathyamoorthy", url: "https://x.com/peramanathan" }],
  creator: "Peramanathan Sathyamoorthy",
  category: "Technology",
  alternates: {
    canonical: "/focus/eeaas-to-agents",
  },
  openGraph: {
    title,
    description,
    url: "/focus/eeaas-to-agents",
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

export default function EeaasToAgentsLayout({ children }: { children: ReactNode }) {
  return children;
}
