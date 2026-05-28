#!/usr/bin/env tsx
/**
 * DEPRECATED — not part of the deployed devprofile app.
 *
 * Collection upload/sync belongs in a separate personal tool (outside this repo) or
 * manual steps in console.x.ai. This portfolio uses read-only xAI keys only.
 *
 * Why: write/management keys in a public-facing app increase blast radius. Read-only
 * search keys can only query content you already published to the Collection.
 *
 * This stub remains as historical reference for the xai-collections client surface
 * used in unit tests (`ensureCollectionForVersion`, `ingestPacket`). Do not run in CI
 * or production. Do not add XAI_MANAGEMENT_API_KEY to .env.local for this project.
 *
 * @see src/lib/qa/xai-collections.ts (search = production; ensure/ingest = tests only)
 * @see src/lib/qa/README.md
 */

async function main() {
  console.error(
    "manual-ingest.ts is deprecated for this repo.\n" +
      "Upload profile files in console.x.ai (or use a separate personal sync tool).\n" +
      "Set XAI_PROFILE_COLLECTION + a read-only XAI_API_KEY in .env.local for the reactor."
  );
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
