import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/focus.css";
import "@/styles/projects.css";

const title = "Projects — product walkthroughs";
const description =
  "Product-led walkthroughs for portfolio systems: local apply cockpit, Tamil metre in WASM, adaptable validators, and local agent transcript labs.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "project walkthroughs",
    "collab-finder",
    "thepulimaangani",
    "Adaptate",
    "agent-prompt-tuning-lab",
    "Tauri",
    "Rust WASM",
    "Zod OpenAPI",
    "Peramanathan Sathyamoorthy",
  ],
  authors: [{ name: "Peramanathan Sathyamoorthy", url: "https://x.com/peramanathan" }],
  creator: "Peramanathan Sathyamoorthy",
  category: "Technology",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title,
    description,
    url: "/projects",
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

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return children;
}
