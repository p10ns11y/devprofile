import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.feature.test.ts", "src/**/*.contract.test.ts"],
    exclude: ["tests/e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json"],
      reportsDirectory: "./coverage",
      include: [
        "src/lib/qa/**",
        "src/lib/certificates/**",
        "src/app/api/cv/qa/route.ts",
        "src/app/api/certificates/**/route.ts",
      ],
      exclude: [
        "**/node_modules/**",
        "src/lib/qa/test/**",
        "src/lib/certificates/**/*.test.ts",
        "src/lib/certificates/index.ts",
        "src/lib/certificates/server.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "server-only": path.resolve(__dirname, "src/lib/test/stubs/server-only.ts"),
    },
  },
});
