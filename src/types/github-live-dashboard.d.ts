import type { HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "github-live-dashboard": HTMLAttributes<HTMLElement> & {
        username?: string;
        layout?: "compact" | "full";
      };
    }
  }
}
