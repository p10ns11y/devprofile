# Profile QA eval

Golden Q&A is parsed from [`src/data/golden-qa.md`](../../src/data/golden-qa.md) and [`src/data/casual-qa.md`](../../src/data/casual-qa.md).

## QA index (dev + production)

The **default** `/qa` path loads [`src/data/qa-index.json`](../../src/data/qa-index.json) at runtime — same in `pnpm dev` and `pnpm start`. The file is **git-tracked** and **regenerated on every `pnpm build`** so CV/golden changes cannot be missed.

```bash
pnpm build             # includes build-qa-index (always sync)
pnpm build-qa-index     # standalone ~15s (MiniLM / transformers locally)
pnpm qa:pipeline       # parse → index → eval (when tuning retrieval)
```

Optional: after `pnpm qa:pipeline`, commit updated artifacts:

```bash
git add src/data/qa-index.json tests/qa/qa-golden.jsonl tests/qa/last-eval-report.json
```

The **xAI reactor** (`ENABLE_XAI_REACTOR=true`) uses live Collections search; it does not read `qa-index.json`.

## Artifacts (track in git)

- **`tests/qa/qa-golden.jsonl`** — parsed golden set.
- **`src/data/qa-index.json`** — precomputed chunks + embeddings + BM25 for default `/qa` (synced on `pnpm build`).
- **`tests/qa/last-eval-report.json`** — latest retrieval metrics.
- **`tests/qa/last-failures.json`** — written when eval finds retrieval failures.

## CI gate

```bash
QA_EVAL_STRICT=1 npm run qa:eval
```

Requires **recall@5 ≥ 85%** on golden rows tagged with `expectedSections`. Without `QA_EVAL_STRICT`, sub-threshold recall prints a warning but exits 0 (useful locally).

## Ollama (optional, human-quality narrative)

Production on Vercel uses **golden-match + templates** only (no API keys). For interview-style depth, point the app at self-hosted Ollama.

**Recommended:** copy [`.env.local.example`](../../.env.local.example) → `.env.local`, set `OLLAMA_BASE_URL`, then restart the dev server:

```bash
cp .env.local.example .env.local
# edit .env.local if Ollama is not on 127.0.0.1:11434
ollama pull qwen2.5:7b
pnpm dev
```

Shell export only works if you start dev **in the same shell** (and restart after changing the variable):

```bash
export OLLAMA_BASE_URL=http://127.0.0.1:11434
pnpm dev
```

If the UI shows `strategy: template` on narrative questions, the Next.js process does not see `OLLAMA_BASE_URL` — use `.env.local` and restart. In development, failed Ollama calls also return `ollamaError` in the API JSON.

The Smart Router sends narrative or low-confidence questions to `qwen2.5:7b` when `OLLAMA_BASE_URL` is set. Eval (`qa:eval`) measures retrieval only; Ollama quality is validated manually or in a future Ollama-enabled eval pass.

## Constants

Thresholds and router rules: [`src/lib/qa/constants.ts`](../../src/lib/qa/constants.ts).
