# Profile QA eval

Golden Q&A is parsed from [`src/data/golden-qa.md`](../../src/data/golden-qa.md) and [`src/data/casual-qa.md`](../../src/data/casual-qa.md).

```bash
# Full pipeline (parse → embed index → eval)
npm run qa:pipeline

# Or step by step
npm run parse-golden-qa
npm run build-qa-index   # ~15s, writes src/data/qa-index.json
npm run qa:eval
```

## Artifacts

- **`tests/qa/qa-golden.jsonl`** — generated golden set (50 pairs).
- **`src/data/qa-index.json`** — build artifact (contextual chunks + embeddings + BM25).
- **`tests/qa/last-eval-report.json`** — latest retrieval metrics.
- **`tests/qa/last-failures.json`** — written when eval finds retrieval failures (Phase 3).

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
