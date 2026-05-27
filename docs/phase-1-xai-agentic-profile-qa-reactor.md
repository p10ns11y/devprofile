# Phase 1: xAI Agentic Profile QA Reactor

**Status**: Implementation in progress via 8-PR Graphite stack (see branch `feature/xai-agentic-profile-qa-reactor` and stacked PRs).

**Primary Design Document** (authoritative, executable by `/execute-plan`):

👉 [.grok/plans/phase-1-xai-agentic-profile-qa-reactor-design.md](../.grok/plans/phase-1-xai-agentic-profile-qa-reactor-design.md)

All PR plans, interfaces, invariants ("xAI Collections sole substrate", "no local vectors in reactor"), user decisions, validation gate, and rollout details live in the design doc.

## Quick Pointers (PR 1 Foundation)
- New deps: `ai`, `@ai-sdk/openai`, `zod`
- Feature flag: `qaReactor` (disabled by default) in `src/config/feature-flags.ts`
- Core types + skeleton: `src/lib/qa/{types.ts,index.ts}`
- Env: `XAI_API_KEY`, `ENABLE_XAI_REACTOR` (see `.env.example`)
- This PR touches only foundations (no route impact). PRs 2-8 build on it.

See the design doc for the full DAG, exact file lists per PR, and the hard validation gate before PR 5.

**Legacy QA path remains 100% intact** until PR 7 dual-path wiring.
