import type { ReactNode } from "react";
import "@/styles/building.css";

export { generateMetadata } from "./social-metadata";

export default function BuildingLayout({ children }: { children: ReactNode }) {
  return children;
}
