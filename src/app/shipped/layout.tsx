import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/focus.css";
import "@/styles/shipped.css";

const title = "Shipped — product walkthroughs";
const description =
  "Product-led walkthroughs for systems that shipped: job hunt desktop app, Tamil metre in WASM, and adaptable validators.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "shipped walkthroughs",
    "collab-finder",
    "thepulimaangani",
    "Adaptate",
    "Tauri",
    "Rust WASM",
    "Zod OpenAPI",
    "Peramanathan Sathyamoorthy",
  ],
  authors: [{ name: "Peramanathan Sathyamoorthy", url: "https://x.com/peramanathan" }],
  creator: "Peramanathan Sathyamoorthy",
  category: "Technology",
  alternates: {
    canonical: "/shipped",
  },
  openGraph: {
    title,
    description,
    url: "/shipped",
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

export default function ShippedLayout({ children }: { children: ReactNode }) {
  return children;
}
