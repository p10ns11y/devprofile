import type { ResolvingMetadata } from "next";
import { pageSocialMetadata } from "@/lib/page-social-metadata";

const title = "Q&A — Peramanathan Sathyamoorthy";
const description = "Ask about experience, projects, and skills, answered from the profile corpus.";

export function generateMetadata(_: unknown, parent: ResolvingMetadata) {
  return pageSocialMetadata(parent, { title, description, path: "/qa" });
}
