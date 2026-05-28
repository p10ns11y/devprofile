#!/usr/bin/env tsx
/**
 * Manual ingest helper stub (PR 3: xAI Collections Thin Client).
 *
 * PURPOSE (per explicit User Decision 5 / Open Question 5 in design):
 *   Phase 1 uses MANUAL/DIRECT user ingest into the Collection via console.x.ai.
 *   Automation (script, on-demand in reactor, Post-PR8 surplus) is deferred.
 *
 *   This file demonstrates how the thin client (collectionsClient) can be called
 *   from a local script once you have a compiled ProfilePacket (from persona-compiler,
 *   PR2). It is intentionally a stub: body is commented. Do not wire into build,
 *   CI, or reactor path.
 *
 * USAGE (with keys; never commit secrets):
 *   XAI_API_KEY=... XAI_MANAGEMENT_API_KEY=... npx tsx scripts/manual-ingest.ts
 *
 *   Or (after compiler lands):
 *   XAI_... npx tsx -e '
 *     import {compileProfilePacket} from "../src/lib/qa/persona-compiler";
 *     import {collectionsClient} from "../src/lib/qa";
 *     const p = compileProfilePacket();
 *     await collectionsClient.ensureCollectionForVersion(p.version);
 *     // await collectionsClient.ingestPacket(p);  // only when you want to push
 *   '
 *
 * The client itself (src/lib/qa/xai-collections.ts) fully implements the ops
 * (ensure + upload + poll + search) with mocks for tests. This script is the
 * "small ingest helper script stub" required by the PR3 plan.
 *
 * After PR8 surplus work may promote a real one-click script.
 *
 * @see .grok/plans/phase-1-xai-agentic-profile-qa-reactor-design.md (Q5, PR3, ingestDocument)
 * @see src/lib/qa/xai-collections.ts
 */

// Uncomment + fill only for local one-off runs with real keys (and after PR2 compiler exists).
// import { collectionsClient } from "../src/lib/qa";
// import { compileProfilePacket } from "../src/lib/qa/persona-compiler";

async function main() {
  console.log("manual-ingest stub (PR3)");
  console.log(
    "Per Q5: Phase 1 ingest is manual via console.x.ai. This is a demonstration stub only."
  );
  console.log(
    "Uncomment body below (or import compiler) + run with XAI_* keys when ready for helper automation (post-PR8)."
  );

  // Example (commented — do not execute in CI or default paths):
  /*
  const packet: ProfilePacket = compileProfilePacket("v1-2026-05"); // or load from disk / fixture
  const ref = await collectionsClient.ensureCollectionForVersion(packet.version);
  console.log("Collection ready:", ref);

  // Only call when you explicitly want to (re)upload from this machine:
  // const result = await collectionsClient.ingestPacket(packet);
  // console.log("Ingest complete:", result);
  */

  console.log("Done (no-op stub).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
