import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certificates — Peramanathan Sathyamoorthy",
  description: "Certificates and credentials.",
  alternates: { canonical: "/certificates" },
  openGraph: {
    title: "Certificates — Peramanathan Sathyamoorthy",
    description: "Certificates and credentials.",
    url: "/certificates",
    siteName: "Peramanathan Sathyamoorthy",
    locale: "en_US",
    type: "website",
  },
};

export default function CertificatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
