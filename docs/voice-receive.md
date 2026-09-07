# Voice Receive — Architecture Decision Record

**Status:** Phase 0–1 (web `/call`) implemented · Phase 2 (PSTN) planned  
**Site:** captain.kingsparrow.space (p10ns11y/devprofile hire surface)  
**Owner:** Operator (Peramanathan Sathyamoorthy)

## Summary

Inbound speech-to-speech on the hire site: a portfolio receptionist answers profile questions grounded in the same corpus as `/qa`, captures `leave_message` for follow-up, and uses **real xAI Grok Voice** (not a mock).

| Phase | Scope | Status |
|-------|--------|--------|
| **0** | ADR, feature flag, kill switch, secrets model | Done |
| **1** | Web `/call` — ephemeral tokens, WSS client, `leave_message`, grounded Q&A | Done |
| **2** | PSTN inbound via **xAI-provisioned number** (CreatePhoneNumberV2 / Voice Agent Builder) | Planned |

## Stack (locked)

| Layer | Choice |
|-------|--------|
| Realtime | `wss://api.x.ai/v1/realtime?model=grok-voice-latest` |
| Browser auth | Ephemeral client secrets only (`xai-client-secret.{token}` in `sec-websocket-protocol`). **Never** ship `XAI_API_KEY` to the client. |
| Token mint | Server `POST https://api.x.ai/v1/realtime/client_secrets` via `POST /api/voice/ephemeral-token` |
| Grounding | Prefer `file_search` + `XAI_PROFILE_COLLECTION`; fallback server tool `profile_search` wrapping `handleQaRequest` |
| Route | `/call` (+ “Talk instead” from `/qa` and homepage when enabled) |
| Feature flag | `ENABLE_VOICE_RECEIVE` (server) · `NEXT_PUBLIC_ENABLE_VOICE_RECEIVE` (UI links) |

Reference: [xAI Speech-to-Speech](https://docs.x.ai/developers/model-capabilities/audio/speech-to-speech) · [Ephemeral tokens](https://docs.x.ai/developers/model-capabilities/audio/ephemeral-tokens)

## Agent behavior

- Role: **portfolio receptionist** for Peramanathan Sathyamoorthy’s hire profile — not Peramanathan himself.
- Tone: second person, **short spoken turns** (one idea per utterance).
- Grounding: **corpus only** — same sources as `/qa` (Collections or local-index fallback). No invented salary, visa status, or commitment dates.
- Escalation: offer `leave_message` for scheduling, direct reach, or off-corpus questions.
- Never claim to **be** Peramanathan or make binding hiring decisions.

### Pronunciation & ASR

`session.replace` (spoken only) and `audio.input.transcription.keyterms`:

- Peramanathan, Sathyamoorthy, Thanjavur, Oneflow, ensembly, collab-finder, kingsparrow

## Tools

| Tool | Handler | Purpose |
|------|---------|---------|
| `file_search` | xAI (server) | Collections grounding when `XAI_PROFILE_COLLECTION` set |
| `profile_search` | Client → `POST /api/voice/profile-search` | Fallback wrapping `handleQaRequest` |
| `leave_message` | Client → `POST /api/voice/leave-message` | Persist + notify operator |
| `end_call` | Client | Goodbye + close session |

### `leave_message` schema

`name`, `email` or `phone`, `topic`, `transcript_excerpt`, `urgency` (`low` \| `normal` \| `high`) → durable `id`.

## Persistence & notify

| Store | When |
|-------|------|
| `.data/voice-messages/*.jsonl` (gitignored) | Local dev / single-instance |
| Operator email | When `RESEND_API_KEY` + `VOICE_NOTIFY_EMAIL` set |

**HITL:** No Resend or Blob/KV in repo yet — messages persist to local JSONL; production operator inbox requires env setup (see `.env.example`). No employer/ATS IDs in public git.

## Secrets

| Variable | Side | Purpose |
|----------|------|---------|
| `XAI_API_KEY` | Server only | Mint ephemeral tokens + `profile_search` reactor |
| `XAI_PROFILE_COLLECTION` | Server | `file_search` vector store id |
| `ENABLE_VOICE_RECEIVE` | Server | Kill switch (`true` to enable APIs + `/call`) |
| `NEXT_PUBLIC_ENABLE_VOICE_RECEIVE` | Build-time public | Show nav / homepage / QA links |
| `RESEND_API_KEY` | Server optional | Operator email notify |
| `VOICE_NOTIFY_EMAIL` | Server optional | Inbox for leave_message alerts |

## Kill switch

Set `ENABLE_VOICE_RECEIVE=false` (or unset). Effects:

- `POST /api/voice/*` → `404`
- `/call` shows unavailable UI (no token mint, no mic)

Redeploy or restart not required if env is runtime (Vercel: change env + redeploy).

## Abuse defense

Voice API routes reuse IP extraction from `/api/cv/qa` and apply lightweight rate limits on token mint and `leave_message` (same bucket pattern as QA edge layer). No cookies.

## OUT of v1

- Outbound dial
- Voice clone
- Binding calendar integration
- Replacing text `/qa`
- **Twilio** (or any third-party PSTN cookbook) — **explicitly OUT**
- PSTN / SIP (Phase 2 only, via xAI)

## Phase 2 — PSTN (planned)

**Operator lock:** Inbound phone MUST use an **xAI-provisioned number** via:

- `POST /v2/phone-numbers` (CreatePhoneNumberV2) — account free-number path where available
- xAI Voice Agent Builder / SIP webhook → same receptionist instructions + tools

**Twilio is OUT** — do not add Twilio dependencies, env vars, or documentation as the telephony path.

**HITL for Phase 2:** Console provisioning, billing, and number assignment on console.x.ai (no code in this repo until operator completes account setup).

## Preview path

1. Set `ENABLE_VOICE_RECEIVE=true`, `NEXT_PUBLIC_ENABLE_VOICE_RECEIVE=true`, `XAI_API_KEY`, and ideally `XAI_PROFILE_COLLECTION`.
2. Deploy preview (e.g. captain.kingsparrow.space preview URL).
3. Open `/call`, allow microphone, ask a profile question; test `leave_message` with a callback email.
4. Verify `.data/voice-messages/` or operator email (if Resend configured).

## Quality merge law

- `pnpm type-check` + `pnpm lint` pass
- Unit tests for flag, leave_message store, profile-search wrapper
- No `XAI_API_KEY` in client bundle (grep CI)
- ADR updated when Phase 2 lands
