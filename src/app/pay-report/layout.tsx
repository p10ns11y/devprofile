import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/pay-report.css";

const title = "Developer pay in Sweden and around the world";
const description =
  "SCB 2025 wage bands and the Stack Overflow Developer Survey 2025, with employer cost and a target range of USD 85k–94k / year (SEK 840k–936k; 70k–78k per month). Data pulled 24 Sep 2026.";

export const metadata: Metadata = {
  title,
  description,
  authors: [{ name: "Peramanathan Sathyamoorthy", url: "https://x.com/peramanathan" }],
  creator: "Peramanathan Sathyamoorthy",
  alternates: {
    canonical: "/pay-report",
  },
  openGraph: {
    title,
    description,
    url: "/pay-report",
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

export default function PayReportLayout({ children }: { children: ReactNode }) {
  return children;
}
