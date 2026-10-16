import type { ResolvingMetadata } from "next";
import { pageSocialMetadata } from "@/lib/page-social-metadata";

const title = "Talk — Voice reception";
const description =
  "Speak with the portfolio receptionist — grounded answers from the same corpus as Q&A.";

export function generateMetadata(_: unknown, parent: ResolvingMetadata) {
  return pageSocialMetadata(parent, { title, description, path: "/call" });
}
