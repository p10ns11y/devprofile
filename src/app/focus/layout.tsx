import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/focus.css";

const title = "Articles — rare notes on learning cost and agent systems";
const description =
  "Notes on Energy Efficiency as a Service mapped onto agents, and why memory should pulse instead of dump. The layers you can actually change: harness and memory.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Focus essays",
    "Energy Efficiency as a Service",
    "EEaaS",
    "agent memory",
    "learning loop",
    "token efficiency",
    "intelligence architectonics",
    "Peramanathan Sathyamoorthy",
  ],
  authors: [{ name: "Peramanathan Sathyamoorthy", url: "https://x.com/peramanathan" }],
  creator: "Peramanathan Sathyamoorthy",
  category: "Technology",
  alternates: {
    canonical: "/articles",
  },
  openGraph: {
    title,
    description,
    url: "/articles",
    siteName: "Peramanathan Sathyamoorthy",
    locale: "en_US",
    type: "website",
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

export default function FocusLayout({ children }: { children: ReactNode }) {
  return children;
}
