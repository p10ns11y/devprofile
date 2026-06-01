import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "200 OK — Live GitHub Activity",
  description: "Live view of recently pushed repositories and daily driver projects from GitHub.",
};

export default function Status200Layout({ children }: { children: React.ReactNode }) {
  return children;
}
