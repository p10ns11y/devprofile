import type { ResolvingMetadata } from "next";
import { pageSocialMetadata } from "@/lib/page-social-metadata";

const title = "CV — Peramanathan Sathyamoorthy";
const description = "Professional curriculum vitae.";

export function generateMetadata(_: unknown, parent: ResolvingMetadata) {
  return pageSocialMetadata(parent, { title, description, path: "/cv/view" });
}
