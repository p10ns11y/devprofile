import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/building.css";

export const metadata: Metadata = {
  title: "Building — landscape of the public stack",
  description:
    "Five cluster bands and four area docks feeding one operator loop. Landscape and spacemap, not a repo dump.",
  alternates: { canonical: "/building" },
};

export default function BuildingLayout({ children }: { children: ReactNode }) {
  return children;
}
