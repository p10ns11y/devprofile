# Ideas and working notes

Dated public notes on how Peramanathan Sathyamoorthy thinks about agents, memory, review and working methods. These sections previously lived in the long profile. The short index is at https://captain.kingsparrow.space/llms.txt and the full profile is at https://captain.kingsparrow.space/llms-full.txt.

## 6. Ideas early: a dated record

Each item gives the date he built or wrote it and a public link. Where the wider community had already discussed a topic, this record does not claim he was first. It shows when he reached the idea and what he did with it.

| Date | Idea | Proof |
|---|---|---|
| 9 Oct 2014 | Build knowledge while collecting data; organise sensor data in dynamic knowledge graphs; cloud-assisted, crowd-sourced optimisation of data communication (MSc thesis) | https://github.com/p10ns11y/bat-boomer |
| 30 Nov to 3 Dec 2015 | Energy efficiency as an orchestration service: devices report selectively, the cloud learns which signals matter, devices report less while decisions improve | IEEE CloudCom 2015, https://doi.org/10.1109/CloudCom.2015.90 |
| 7 Nov 2017 | Journal version: profiling energy efficiency and data communications for the mobile IoT | https://doi.org/10.1155/2017/6562915 |
| 13 Jan 2017 | Tooling that removes manual work for a whole codebase: generate translation files from JSX | https://github.com/p10ns11y/babel-plugin-react-intl-messages-generator , npm 15 Jan 2017 |
| 2 Nov 2021 | Phrase-driven CLI: say "rebase then push", the tool shows and runs the steps | https://github.com/p10ns11y/hy (8a5f334) |
| 3 Nov 2024 | One schema, per-consumer required fields at runtime ("dynamic schema builder") | adaptate cb2a7d9, https://github.com/p10ns11y/adaptate |
| 13 Jan 2025 | The best coder is the best decoder of dependencies and connections, and that is the north star for coding agents | https://x.com/Peramanathan/status/1878758173131338022 |
| 29 Apr 2025 | Developers who leave closed-source jobs have no proof of their coding style, so keep a public, verifiable record | https://x.com/Peramanathan/status/1917134961888346559 , built as devprofile from 8 Sep 2025 |
| 11 Apr 2026 | Data-first portfolio: one data file keeps every surface consistent and lets agents produce any number of UIs | https://x.com/Peramanathan/status/2042939526352638283 |
| 12 and 21 May 2026 | Supply chain: avoid local installs during worm outbreaks; install source, keep verified extracts, sign exported code blocks | https://x.com/Peramanathan/status/2054061517063209147 , https://x.com/Peramanathan/status/2057338328324911454 , https://x.com/Peramanathan/status/2057359284405784606 , built as imm from 22 Sep 2026 |
| 8 Jun 2026 | Layered lenses instead of switching hats or personas in agent workflows | https://x.com/Peramanathan/status/2063862714582155500 |
| 9 Jun 2026 | Agent failures are mostly context, coordination and guardrail failures, not model failures | https://x.com/Peramanathan/status/2064381462405927288 , skills library from 8 Jun 2026 |
| 21 Jun 2026 | Agents should keep a living model of where the builder is in their thinking and adapt depth | https://x.com/Peramanathan/status/2068577562041987378 |
| 26 Jul 2026 | A formal dialect with progressive disclosure can save tokens and raise accuracy | https://x.com/Peramanathan/status/2081344332268032152 , AppGenMathPhyLang in the skills repo |
| 5 Aug 2026 | The cost of the next useful observation must fall while decision quality rises; the 2015 rule applied to agents | https://x.com/Peramanathan/status/2084848818177380653 , essay https://captain.kingsparrow.space/articles/eeaas-to-agents |
| 27 Aug 2026 | Agent memory should pulse, not dump: a compact signal, then a surgical, verified snippet | https://x.com/Peramanathan/status/2092840880751415412 , essay https://captain.kingsparrow.space/articles/memory-issue , plugin 29 Aug 2026 |
| 28 Aug 2026 | Archive is not memory: data, context, fact and memory are four different things; memory is a trace kept because it should change a later action | https://x.com/Peramanathan/status/2093296586675912712 , essay https://captain.kingsparrow.space/articles/memory-issue/archive-not-memory |
| 2 Oct 2026 | A decision model is not a smaller chat model; agreement between two models is not verification; check correlation with Cohen's kappa | https://x.com/Peramanathan/status/2106128083027664952 |
| 7 Oct 2026 | Review areas, not diffs: split the app into areas from its imports, set each area's review cadence from git churn, keep PR review for secrets, auth, dependencies, payments and personal data | https://x.com/Peramanathan/status/2107917582926025047 |
| 8 Nov 2026 | Body-inspired agent design: an organ exists only when no other can own the function; one shared bus; flow follows demand; compute cannot exceed intake | https://x.com/Peramanathan/status/2119436174641050037 |
| 16 Nov 2026 | AI/SI bots are the new browsers: build light services that run inside bot ecosystems, start opt-in, log everything, act freely only on safe and reversible artifacts | https://x.com/Peramanathan/status/2122431792619855888 |

The two strongest early threads:

1. Measure less, decide better (2014 to 2026). His thesis and his 2015 and 2017 papers argued for selective sensing: learn which signals matter, then report less while decisions improve. Ten years later the same rule shapes his agent work. Context and memory cost tokens, latency and energy, so an agent should load only what can change the next decision. The line runs through the thesis repository (2014), the CloudCom paper (2015), the journal paper (2017), the EEaaS essay (August 2026) and the pulse-memory plugin (August 2026).
2. Tooling that enforces the rule, so people do not have to remember it (2017 to 2026). The Babel plugin generated translation files instead of asking developers to write them. The TypeScript conversion script kept history instead of asking reviewers to trust a rewrite. adaptate's README examples run as tests. imm refuses agent self-approval in code. The eva-emptiness tether denies force-push in a hook.

## 7. Ideas still ahead

These are directions he has written about and started building. The industry has not settled on them yet.

- Pulse memory as a decision qualifier. Frontier products mostly treat memory as more context. His position (X, 8 November 2026) is that memory is a past trace kept because it should change a later action: "a qualifier for the next decision, not a larger window." The harness emits a compact pulse with a key, a verification flag and a prefetch hint, and memory returns only a snippet that still matches its locked revision. Proof: https://x.com/Peramanathan/status/2119434548081516763 and the pulse-memory plugin.
- The Ensembly record layer. Every fact has one owner, every write carries an idempotency key, events keep event time and versions in an append-only log, and every action follows "write intent, act, verify". Views only read. Proof: Ensembly PR #97 (18 November 2026) and the retrieval benchmarks.
- Runtime verification of what enters a system. adaptate's choke-point Result API is the first step: validate at the boundary and keep an ok track and an error track. The next step, tracked as an open issue in adaptate, is to check a download's hash and metadata before it is stored, and to bring formal checks into everyday runtime code. imm applies the same idea to dependencies.
- Decision models beside LLMs. Use a calibrated classifier over a closed set of labels on the hot path, use the LLM when the label set might be wrong, and measure agreement with Cohen's kappa before trusting a second judge.
- Area-based review for AI/SI-written code. PRs land faster than people can read them, so the unit of review becomes the system's area, on a cadence set by churn, with PR review kept for security-critical changes.
- Light services inside bots. Services that run inside a user's bot, opt in per run, log and replay everything, and never act on anything irreversible without a consent card.

## 8. Work style and thinking process, 2010 to now

### 8.1 How his thinking changed, era by era

Research era, 2010 to 2016 (Uppsala University)

- Focus: energy-constrained systems, measurement cost, distributed systems, peer-to-peer computing, algorithms. His best-graded courses at Uppsala were Advanced Algorithms, Algorithms and Data Structures II, Peer-to-Peer Computing and Cryptology.
- Thinking: measuring is itself a cost. Learn which signals matter, then measure less.
- Evidence: thesis repository (9 October 2014), CloudCom 2015 paper, a Wiley journal paper (2017).
- On X in 2012 he shared Fred Brooks' "Plan to throw one away" (20 February 2012) and Knuth on sorting and searching (22 January 2012), early signs of the prototype-first habit he still follows.

Product-builder era, 2016 to 2017 (Weavler)

- Focus: accessibility, small-team full-stack delivery, cost.
- Thinking: when a task repeats across a codebase, write the tool once. When users differ, adapt the interface to them (text customisation, colour filters, speech).
- Evidence: the Babel plugin on npm (January 2017); reactube (February 2016), a React app built to explain its own `props` and `state`; comment-on-highlight (February 2017), with no third-party packages.

Integration and platform era, 2017 to 2021 (Oneflow, JavaScript Developer and Integration Engineer)

- Focus: legacy modernisation without stopping the product, public APIs, other companies' permission models.
- Thinking: grow the new system inside the old one (React Router inside Backbone). Evaluate before adopting: he built small evaluation repositories before committing, such as ckeditor5-tour (January 2018), react-redux-quest (March 2018), formik-react-select-testing (February 2020) and draftjs-editor-app (April 2021, before co-leading the rich-text editor). Teach what you know: a lightning-talk repository on git (September 2020).
- Rust and WebAssembly from 2020: rust-wasm-app and rust-wasm-bindgen-app (April 2020), the start of thepulimaangani.

Leadership and quality era, 2021 to 2024 (Oneflow, Team Lead and Senior Engineer)

- Focus: team practices, test strategy, type safety, permissions.
- Thinking: turn the team's real habits into tooling (mob-testing sessions became the first Playwright tests). Migrate in place and keep history. Put one owner on each rule (one ACL module).
- Evidence: CV entries for these roles; bestjs, a test framework built from Jest packages (October 2021); hy (November 2021); merge-strategy evaluation (September 2024); latex-cv (October 2024); adaptate (November 2024).

Agent era, 2025 to now — Independent AI/SI product and systems engineering (agentic workflows)

- Focus: LLM tooling, agents, memory, verification, supply chain.
- Thinking: code is now cheap and evidence is the expensive part (X, 1 October 2026). People own intent, acceptance criteria and release, and agents do the rest. Every irreversible act is verified first. Memory must be earned, not dumped.
- Evidence: devprofile (September 2025), the skills library (June 2026), collab-finder (June 2026), the plugins marketplace (July 2026), Ensembly (July 2026), the essays (August and September 2026), imm (September 2026), area-based review (October 2026) and adaptate streaming and Result APIs (November 2026).

### 8.2 Traits, each as a contribution to any team

Each trait has a dated, public example.

1. Builds tools that compound and save the team's time. Example: a Babel plugin that generated translation files for a whole React project (January 2017); a script that converted JavaScript to TypeScript and kept history (Oneflow, 2023–2024, per CV); plugins and skills that run his engineering workflow (2026). What a team gets: repeated work becomes a one-time tool.
2. Goes deep, then builds on the depth. Example: adaptate went from a dynamic schema builder (November 2024) to OpenAPI round-trips, streaming validation, an incremental parser and a Result API (November 2026), with 214 commits and every README claim tied to a test. What a team gets: a component that keeps getting better instead of being rewritten.
3. Security by design, with no back doors. Example: his X posts on device back doors and spyware (25 January and 29 March 2026); keys in the OS keyring in collab-finder; 2.4.2 published from CI with SLSA provenance; imm refusing agent self-approval; a supply-chain warning during the 2026 npm worm outbreak (12 May 2026). What a team gets: security decisions made in the design, not patched later.
4. Rules enforced by tooling, not by memory. Example: performance budgets that fail a PR more than 5% slower; README snippets run as tests; a shell tether that denies force-push; CRAP limits and mutation testing (X, 1 May 2026). What a team gets: fewer review arguments, because the check runs on every change.
5. Verifies before irreversible acts. Example: the live-engine plugin's rule "verify before irreversible acts, then recover" (8 November 2026); "write intent, act, verify" in the Ensembly record layer; "Own and act freely only on the own artifacts and data that are safe and reversible" (X, 16 November 2026). What a team gets: agents and automation that stay safe to run.
6. Reviews by area and risk, not by habit. Example: "review areas, not diffs" (X, 7 October 2026), with nightly, weekly or monthly cadence by churn and PR review kept for secrets, auth, dependencies, payments and personal data. What a team gets: review effort spent where the risk is.
7. Lean, visual documentation. Example: repositories that read in a fixed order with a Mermaid map (proposales-planner-bench), proof tables (adaptate), and essays built around diagrams. What a team gets: docs a new person can follow in minutes.
8. Measures before trusting. Example: Ensembly's retrieval benchmark ("measure only") before any ranking change; Cohen's kappa before trusting a second model (X, 2 October 2026); a stranger test for installs. What a team gets: decisions based on numbers from the team's own cases.
9. Explains by building the smallest working thing. Example: reactube, a React app that explains its own props and state (February 2016), and prototype-it-to-explain-itself (June 2026). What a team gets: ideas tested in code before they turn into long documents.

### 8.3 Gaps in this record

- Much of his deep-learning and systems work is private and not public. The public repositories are a record that grew slowly as he learned and crafted over time, not the full depth of that work.
- Public evidence from 2017 to 2024 is thinner than from 2025 on, because most of that work was in a closed-source codebase. Oneflow outcomes and percentages come from his CV and were not checked against outside sources.
- His X posts from 2011 to 2024 are mostly personal and general. Technical posting starts in earnest in late 2024.
- No public talks or conference recordings were found apart from the 2020 git lightning-talk repository and the 2015 conference paper.
- Reach is the gap so far. The projects have few outside users, stars or contributors yet.

### 8.4 Build lifecycle

Projects form, melt into each other and come back as new ones; nothing useful is thrown away. The loop is drawn at https://captain.kingsparrow.space/building, with a dated timeline and an honest note on reach in section 6 of https://captain.kingsparrow.space/llms-full.txt.

## 9. How skills and plugins help the work

He treats agent instructions as engineering artifacts: versioned, tested, credited and shared.

- Skills hold procedures that are boring, tedious, error-prone or heavy on memory. In his words (X, 23 May 2026): "these are skills sometimes boring, tedious, error-prone and need high cognitive load to do them manually." He says a small set of them "pretty much solves 90% of the problem in any arbitrary projects."
- Plugins bundle skills with commands, agents and hooks, so one install works across Grok Build, Claude Code and Cursor. The marketplace catalogs live in one repository.
- Hooks enforce the rules a person would forget: ask before `git push`, deny force-push, stop when an approval belongs to a human.
- Memory plugins keep agent context small and verified: pulse-memory admits only dated, sourced snippets that should change a later action.
- Routing plugins keep each task to a few skills (intelli-route allows at most four) and put each check at its earliest layer (trust-stack).
- Planning plugins compute the critical path and uncertainty (mission-map uses PERT and Monte Carlo), so work follows the chain that decides the outcome.
- Results he has posted: about 20 PRs in two days of 20 to 60 minute bursts, driven from a phone, with "great foundations, security guards, tests, CRAP limit" (X, 1 May 2026).

## 10. Working methods

- Plan in hours and ship in small, reviewable PRs. Large changes are split with a dedicated skill.
- Intent, acceptance criteria and release stay with people; agents do the rest.
- Every public claim maps to a test, a script, a CI job or a link.
- One source of truth for data. The CV, site, PDF and agent files all render from one file.
- Verify before anything irreversible: merges, releases, payments, deletions and messages.
- Supply-chain hygiene: pinned package managers, pnpm workspace policies, Socket Firewall, and SLSA provenance on releases.
- Accessibility and semantic HTML by default.
- Credit inspiration in the docs, in the same style for every source.
