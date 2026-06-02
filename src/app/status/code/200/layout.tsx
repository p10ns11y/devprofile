import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Status 404 Found! — Live GitHub Activity",
  description:
    "Live GitHub activity with a playful status joke: the page is /status/code/200 but the banner says 404 on purpose.",
};

export default function Status200Layout({ children }: { children: React.ReactNode }) {
  return children;
}
