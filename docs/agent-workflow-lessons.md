# Lessons from Long-Running Agent Plans (Execute-Plan + Worktrees + Graphite)

This document captures hard-won lessons from the Phase 1 xAI Agentic Profile QA Reactor effort (PLAN_ID 80eccd53), which involved an 8-PR Graphite stack built across many sessions using heavy subagent orchestration, git worktrees, and final manual integration with Graphite (`gt`).

These patterns are especially relevant when running `execute-plan`, multi-wave orchestration, or any work that spans days/weeks and ends with a user-managed stack submission.

## 1. Worktree Sessions vs User's Main Environment (The Fundamental Friction)

**The problem**: Almost all agent execution (especially via `concurrent-cli-agents` + worktrees) happens inside `~/.grok/worktrees/<repo>/...`. 

The user's "real" terminal — where they authenticate tools (`gt auth`, GitHub CLI, etc.), run `gt submit --stack`, test locally with their normal env, and do final integration — is almost always in their primary clone (outside the `.grok` worktree tree).

**Observed consequences**:
- Branch state divergence (agent sees different tips than user).
- Authentication done in one terminal is invisible to the Grok session.
- User often has to manually run final `gt submit --stack` steps because the agent environment cannot.
- Commands like `source ~/.bashrc` after authenticating in a new terminal become necessary rituals.

**Recommendations**:
- Treat the Grok/agent session as a **build environment**, not the user's primary development shell.
- When giving final integration instructions, explicitly say: "Run these in a fresh terminal where `gt` is authenticated (after `source ~/.bashrc` if needed)."
- For long plans, periodically remind the user (or yourself) to fetch in their main clone so state doesn't drift too far.
- Consider documenting "handoff points" where control intentionally moves back to the user's authenticated terminal.

## 2. Branch Naming Collisions Are Expensive

**The problem**: During this plan we created (and pushed) a branch named `feature/xai-agentic-profile-qa-reactor`. The user already had a local branch with the **exact same name** containing their earlier Phase 0 / planning work (4 commits ahead of main, tracking `origin/main`).

This caused:
- Confusion in `git branch -vv`
- Tracking branch mismatches
- Extra recovery work to rename and re-push under `-stack`

**Root cause**: The agent chose a "natural" feature name without checking what the user already had locally for that domain.

**Recommendations**:
- When producing a final integration / stack branch from an execute-plan or long orchestration, **never** reuse a plausible feature branch name the user might already own.
- Preferred patterns (in rough priority):
  - `feature/<thing>-stack` (e.g. `feature/xai-agentic-profile-qa-reactor-stack`)
  - `ep/<plan-id>-<short-name>` (e.g. `ep/80eccd53-qa-reactor`)
  - `agent-stack/<plan-id>` or similar clearly artificial names
- Before creating the final stack branch, ask the user: "What name should the final integration branch have? I recommend `<name>-stack` to avoid colliding with any existing feature work."
- Add this check to the final "stack assembly" phase of any long plan.

## 3. Graphite (`gt`) + Execute-Plan Integration Is Still Manual at the End

**The problem**: The execute-plan skill excels at producing many clean, reviewed `execute-plan/<plan-id>-pr-N-*` branches. Converting that output into a real Graphite stack that the user can manage with `gt submit --stack`, `gt restack`, etc. is not fully automated from inside an agent session.

Observed friction:
- `gt` authentication and "synced repos" state are tied to the user's terminal/environment, not reliably available inside the Grok worktree session.
- Even when the agent can build the commits, the final `gt submit --stack` (or creation of proper stack levels) often has to be driven by the user in their main shell.
- A single linear branch containing all PR commits is easy to produce via cherry-pick, but less ideal for Graphite review workflows than true multi-level stacks.

**Recommendations**:
- Plan for a deliberate "handoff" phase at the end of any execute-plan where the user takes over final stack submission in their authenticated environment.
- Document the two realistic paths clearly:
  1. Linear branch + `gt submit --stack` (fast, one PR or simple stack).
  2. Proper multi-level stack (using `gt split --by-commit` on the linear result, or manually creating levels from the individual PR branches).
- When the agent builds the linear stack branch, also leave clear instructions + the list of original PR branch names so the user can choose the split approach later.
- Consider adding "gt stack handoff" as an explicit final deliverable in long execute-plan prompts.

## 4. Session and Environment Fragmentation Is Normal — Design For It

Long plans that span multiple Grok sessions + the user's own terminals will have fragmented state:
- Plan JSON, reviews, and summaries in `/tmp/` (session-local).
- gt auth in whichever terminal the user last used.
- Different views of the same remote branches depending on which checkout the user is in.

**Recommendations**:
- Make key artifacts (final branch name, commit SHAs of each PR, "what the user needs to do next") prominent in the last summary the agent produces.
- When resuming across sessions, the orchestrator should re-orient around "what is the current state of the target stack branch on the remote?" rather than assuming local state.
- Encourage the user to treat the remote `origin/feature/xxx-stack` branch as the source of truth for the final deliverable.

## 5. Other Notable Anti-Patterns Observed

- Reusing a "natural" feature branch name for agent-produced integration work.
- Assuming the agent session has the same tool authentication state as the user's interactive terminals.
- Treating worktree branches as directly usable by the user without explicit fetch + rename guidance.
- Under-documenting the final "how do I turn this into my Graphite stack?" step for the user.

## 6. Commit Message Attribution Pollution (Cross-LLM Boilerplate)

**The problem**: During a long `execute-plan` + Graphite redistribution session, the agent suggested commit messages containing standard Claude Code boilerplate:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

The user had **never installed or used Claude** on the machine. This created significant confusion about who actually performed the git work (the user + Grok via this CLI) and made the history look like Claude had been involved.

**Root cause**: The agent reused a common commit message template from Cursor + Claude Code workflows without checking the user's actual toolchain or environment.

**Recommendations**:
- Never inject attribution or boilerplate from other LLMs (Claude, Cursor, etc.) into commit messages, PR descriptions, or suggested git commands unless the user has explicitly confirmed they are using that tool in the current context.
- When suggesting commit messages during agent-driven git work (execute-plan, split-to-prs, manual stack cleanup, etc.), use clean, factual messages only. If attribution is desired, ask the user first or default to neutral language ("Assisted by Grok Build" is acceptable only if the user is in a Grok-native session).
- Add an explicit check in agent prompts for long-running git-heavy work: "Confirm the user's primary agent/LLM environment before suggesting any commit message templates."
- This lesson applies especially to `execute-plan`, `split-to-prs`, `git-worktrees`, and `agent-orchestrator` skills.

## Future Improvements (for skills & rules)

These lessons should feed into:

- Stronger guidance in `git-worktrees` and `agent-orchestrator` skills around final integration branch naming and user handoff.
- Better defaults or prompts in `execute-plan` for the "stack assembly" phase (including explicit gt handoff instructions).
- Possibly a lightweight rule or checklist item: "When producing a long-lived feature/integration branch, always propose a `-stack` or plan-ID-prefixed name and confirm with the user."
- **Disk hygiene tooling** (done): The new `agent-worktree-clean.sh` + "Disk hygiene" section in `git-worktrees` directly addresses the `~/.grok/worktrees/` bloat problem called out in Lesson 1. After any plan with 5+ PRs, run the cleaner.
- **Commit message hygiene** (added): `.agents/rules/fusion-sage.mdc`, `.agents/rules/agent-workflow.mdc`, and `.agents/rules/split-to-prs.mdc` now contain the rule against injecting other-LLM boilerplate into commits. The lesson is also captured here as Lesson 6.

---

*Captured after the successful completion of the 8-PR xAI Agentic Profile QA Reactor plan (May 2026). This was one of the more complex multi-session, multi-worktree, gt-involved efforts run in this repo.*