"use client";

import { useEffect, useState } from "react";

type GitHubLiveDashboardHostProps = {
  username?: string;
};

export function GitHubLiveDashboardHost({
  username = process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? "p10ns11y",
}: GitHubLiveDashboardHostProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    import("@/web-components/github-live-dashboard.js").then(() => {
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <p className="text-center text-text2 py-12" aria-live="polite" data-visual-live>
        Loading live GitHub activity…
      </p>
    );
  }

  return (
    <div data-visual-live>
      <github-live-dashboard username={username} layout="compact" />
    </div>
  );
}
