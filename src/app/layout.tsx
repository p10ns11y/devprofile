import "@/styles/globals.css";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { VercelToolbar } from "@vercel/toolbar/next";
import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { Suspense } from "react";
import { BuildingActivityModal } from "@/components/building/building-activity-modal";
import { CvModal } from "@/components/cv/cv-modal";
import { PersonJsonLd } from "@/components/person-json-ld";
import { SWRegister } from "@/components/sw-register";
import { ThemeProvider } from "@/components/theme-provider";
import cvdata from "@/data/cvdata.json";
import { getMetadataBase } from "@/lib/site-url";

const siteTitle = `${cvdata.name} — ${cvdata.landing.role}`;
const siteDescription = cvdata.landing.meta_description;

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: "Peramanathan Sathyamoorthy",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    creator: "@peramanathan",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const shouldInjectToolbar = process.env.NODE_ENV === "development";
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body
        className={`${instrumentSerif.variable} ${dmSans.variable} font-(family-name:--font-body) antialiased overflow-x-clip`}
      >
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand text-white px-4 py-2 rounded z-50"
          >
            Skip to main content
          </a>
          <PersonJsonLd />
          <SpeedInsights />
          <SWRegister />
          {shouldInjectToolbar && <VercelToolbar />}
          <main id="main">{children}</main>
          <Suspense fallback={null}>
            <CvModal />
            <BuildingActivityModal />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
