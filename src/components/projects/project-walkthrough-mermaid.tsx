"use client";

import { useEffect, useId, useRef } from "react";
import { useTheme } from "@/components/theme-provider";

export function ProjectWalkthroughMermaid({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderId = useId().replace(/:/g, "");
  const { theme } = useTheme();

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === "dim" ? "dark" : "neutral",
        securityLevel: "strict",
        fontFamily: "inherit",
      });

      if (!containerRef.current || cancelled) {
        return;
      }

      const { svg } = await mermaid.render(`walkthrough-${renderId}`, code);
      if (!cancelled && containerRef.current) {
        containerRef.current.innerHTML = svg;
      }
    }

    void render();

    return () => {
      cancelled = true;
    };
  }, [code, renderId, theme]);

  return (
    <figure className="projects-diagram" aria-label="Architecture diagram">
      <div ref={containerRef} className="projects-diagram__canvas" />
    </figure>
  );
}
