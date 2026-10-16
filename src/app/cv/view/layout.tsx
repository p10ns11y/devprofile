import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV — Peramanathan Sathyamoorthy",
  description: "Professional curriculum vitae.",
  alternates: { canonical: "/cv/view" },
  openGraph: {
    title: "CV — Peramanathan Sathyamoorthy",
    description: "Professional curriculum vitae.",
    url: "/cv/view",
    siteName: "Peramanathan Sathyamoorthy",
    locale: "en_US",
    type: "website",
  },
};

export default function CvViewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
