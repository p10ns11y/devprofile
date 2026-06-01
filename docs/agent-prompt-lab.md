# Agent Prompt Lab

Agent transcript harvesting and preprocessing for prompt tuning lives in a **separate project**, not in this portfolio repo.

When extracted from devprofile, the bundle is at **`agent-prompt-lab/`** at the repository root. Move that folder to your own path on the host, then `git init` there.

```bash
mv /path/to/devprofile/agent-prompt-lab ~/Work/personal/agent-prompt-lab
cd ~/Work/personal/agent-prompt-lab
git init
pnpm seed-manifest
```

See `agent-prompt-lab/README.md` for harvest, normalize, and pipeline docs.
