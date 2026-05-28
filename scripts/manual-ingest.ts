#!/usr/bin/env tsx
/**
 * DEPRECATED — not part of the deployed devprofile app.
 *
 * Collection upload/sync belongs in a separate personal tool (outside this repo) or
 * manual steps in console.x.ai. This portfolio uses read-only xAI keys only.
 *
 * This portfolio uses XAI_MANAGEMENT_API_KEY for read-only Collections search and
 * XAI_API_KEY for Grok chat — not for upload/write from this repo.
 *
 * This stub remains as historical reference for ensure/ingest client methods (unit tests only).
 *
 * @see src/lib/qa/xai-collections.ts (search = production; ensure/ingest = tests only)
 * @see src/lib/qa/README.md
 */

async function main() {
  console.error(
    "manual-ingest.ts is deprecated for this repo.\n" +
      "Upload profile files in console.x.ai (or use a separate personal sync tool).\n" +
      "Set XAI_PROFILE_COLLECTION plus read-only XAI_MANAGEMENT_API_KEY (collections) and XAI_API_KEY (chat) in .env.local."
  );
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
