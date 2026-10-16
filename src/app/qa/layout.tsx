import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Q&A — Peramanathan Sathyamoorthy",
  description: "Ask about experience, projects, and skills, answered from the profile corpus.",
  alternates: { canonical: "/qa" },
  openGraph: {
    title: "Q&A — Peramanathan Sathyamoorthy",
    description: "Ask about experience, projects, and skills, answered from the profile corpus.",
    url: "/qa",
    siteName: "Peramanathan Sathyamoorthy",
    locale: "en_US",
    type: "website",
  },
};

export default function QaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
