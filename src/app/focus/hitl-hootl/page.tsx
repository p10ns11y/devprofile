import Link from "next/link";
import { FocusRelated } from "@/components/focus/focus-related";
import { FocusSeriesNav } from "@/components/focus/focus-series-nav";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SiteButton } from "@/components/site/SiteButton";

export default function HitlHootlPage() {
  return (
    <div className="focus-page min-h-screen">
      {/*
        THESIS: Automate digital, surface physical, wait for permission. HITL optional; HOOTL swarm on critical path.
        OWN-WORLD: Same Focus editorial tokens; series nav back to /essays.
        STORY: Not playing a game → two modes → graph/CP → two layers → what remains hard → how to measure.
        FIRST VIEWPORT: Title + lede + four design principles.
        FORM: Nested Focus essay; no diagram unless earned — prose + definition list for eval criteria.
        FINISH: polish + PR; type-check/lint green.
      */}
      <Header />

      <div className="focus-page__shell">
        <header className="focus-page__intro">
          <FocusSeriesNav current="hitl-hootl" />
          <h1 className="focus-page__title">
            Automate the digital, surface the physical — HITL and HOOTL for ensembly
          </h1>
          <p className="focus-page__lede">
            I am building{" "}
            <a className="focus-link" href="https://kingsparrow.space">
              ensembly
            </a>{" "}
            as a life operating system: a thin kernel that owns state, a helper swarm that clears
            digital thrash while I am away, and an optional surface where I can verify that
            everything still holds. This essay distils the{" "}
            <a
              className="focus-link"
              href="https://github.com/thecuriousts/ensembly/issues/1"
              target="_blank"
              rel="noopener noreferrer"
            >
              fitness spec for human-in-the-loop and human-out-of-the-loop
            </a>
            .
          </p>
        </header>

        <article className="focus-page__article">
          <blockquote className="focus-maxim">
            <p>
              Automate the digital. Surface the physical. Wait only for permission. Make the truth
              playable.
            </p>
            <footer>Design law for ensembly</footer>
          </blockquote>

          <h2>I am not playing a game</h2>
          <p>
            There is no recreational play loop here—no dopamine farm, no strategy for its own sake.
            The interface may borrow game affordances later: rhythm, spatial layout, a map of what
            matters. That is taste, not addiction.{" "}
            <strong className="focus-mark">Joining is a deliberate act.</strong> Human-in-the-loop
            (HITL) is an optional verification and steering surface. I step in when I want to
            confirm that payments, obligations, queues, and systems are progressing as expected—or
            when a gate demands my body or my explicit approve/deny.
          </p>
          <p>
            Fast agent stacks are not the enemy. Grok Bot is smooth; I use it. The question is what
            a life OS must own when the model session ends: the graph of what depends on what, the
            critical path through it, and the law that auth and physical gates never self-approve.
          </p>

          <h2>While I am out: HOOTL</h2>
          <p>
            Human-out-of-the-loop (HOOTL) is the default working mode. A helper swarm operates
            against the current state of life—curating, prioritising, balancing, clearing digital
            thrash so scarce attention stays reserved for two irreducible classes:{" "}
            <span className="focus-term">body-world pickups</span> (only a physical presence can
            complete them) and <span className="focus-term">authorization gates</span> (real risk,
            irreversibility, explicit permission).
          </p>
          <p>
            Prioritisation is not a flat to-do list. Urgency and importance form a directed graph of
            strongly connected, sequentially dependent clusters. From that graph the runtime derives
            the <span className="focus-term">critical sequential path</span>—the chain whose timely
            resolution determines overall health. PERT and Monte Carlo are tools I may use to
            quantify uncertainty and surface bottlenecks. They are not the product story. The story
            is: the swarm works the path the kernel names, not whatever is loudest in the inbox.
          </p>

          <h2>Two layers, one truth</h2>
          <p>
            The architecture splits cleanly. The{" "}
            <strong className="focus-mark">kernel / runtime</strong> owns life-state, the dependency
            graph, critical-path calculation, HITL escalation, triggers, and the message bus. It is
            the thin structural source of truth. Intelligence is rented or open—I do not grow a new
            organism inside the kernel each day.
          </p>
          <p>
            <strong className="focus-mark">Workers</strong> sit underneath: multi-agent helpers that
            execute digital chores, report status, and return verified artifacts. They coordinate
            through the graph and the bus, not through ad-hoc chatter. Game clients, Unity scenes,
            GPS beacons can sit on the same protocol later. They are not the core. The core is
            coordination, invoke/trigger, concurrent state, and typed messaging.
          </p>
          <p>
            That split mirrors what the{" "}
            <Link className="focus-link" href="/focus/memory-issue">
              memory essays
            </Link>{" "}
            argued from another angle: pulse instead of dump, archive admissions instead of log
            completeness. Here the kernel pulses priorities; workers inject surgical results; HITL
            surfaces only what still needs a human.
          </p>

          <h2>What remains hard</h2>
          <p>
            Stripping optional game chrome leaves four engineering problems that actually determine
            quality:
          </p>
          <ol className="focus-page__phases">
            <li>
              <strong>Coordination</strong>
              <span>
                Concurrent agents on shared life-state without conflict or thrash. The dependency
                graph is the coordination substrate—claim work through it, not around it.
              </span>
            </li>
            <li>
              <strong>Invoke / trigger</strong>
              <span>
                Time-sensitive activation from life-state changes, schedules, or external events.
                Declarative triggers beat scattered conditionals.
              </span>
            </li>
            <li>
              <strong>State updates</strong>
              <span>
                Consistent, auditable mutation of life-state and graph. One narrow interface;
                ordered or transactional where it matters.
              </span>
            </li>
            <li>
              <strong>Message passing</strong>
              <span>
                Typed, reliable communication between kernel and workers—manual commands, automatic
                triggers, and status reports on the same bus.
              </span>
            </li>
          </ol>

          <h2>How I measure outcomes</h2>
          <p>
            I will not map biology one-to-one. Evolution is slow; my operator has one life.
            Generational gain comes from harness design and evals, not from pretending every day is
            a new species. Evolution-shaped loops are reserved for multi-session blanks that cannot
            close in one tick—not for clearing email.
          </p>
          <p>Verified artifacts answer three questions:</p>
          <dl className="focus-pulse">
            <div>
              <dt>correct?</dt>
              <dd>Does the result match the job spec and pass HITL auth when required?</dd>
            </div>
            <div>
              <dt>effective?</dt>
              <dd>
                Did it save future energy and effort—shorter critical path, less thrash tomorrow?
              </dd>
            </div>
            <div>
              <dt>efficient?</dt>
              <dd>
                Did it spend less time and cost for this step—probe budget, wall clock, tokens?
              </dd>
            </div>
          </dl>
          <p>
            That triad is closer to active design-of-experiments and robust decision-making under
            uncertainty than to open-ended Darwinian machine evolution. The swarm stays structural;
            the models I call are interchangeable renters.
          </p>

          <aside className="focus-aside" aria-label="Complement, not competition">
            <p>
              Agent products that feel magical in a chat window solve a different slice. ensembly is
              the ledger and the path underneath: what must happen, in what order, with whose
              permission—and what got done while I was living offline from the screen.
            </p>
          </aside>

          <h2 id="closing">Closing</h2>
          <p>
            The{" "}
            <Link className="focus-link" href="/focus/eeaas-to-agents">
              EEaaS to agents essay
            </Link>{" "}
            insisted that the cost of the next useful observation must fall while decision quality
            rises.{" "}
            <Link className="focus-link" href="/focus/memory-issue">
              Pulse instead of dump
            </Link>{" "}
            made that operational for memory.{" "}
            <Link className="focus-link" href="/focus/memory-issue/archive-not-memory">
              Archive is not memory
            </Link>{" "}
            asked what may enter the harness at all. HITL and HOOTL ask who runs the day: the swarm
            on the critical path by default, me at the gates when judgment cannot be delegated.
          </p>

          <blockquote className="focus-maxim">
            <p>
              Automate the digital. Surface the physical. Wait only for permission. The human stays
              the scarce resource; the kernel keeps the truth thin and playable.
            </p>
            <footer>Engineered for the greatest good · not the greatest play loop</footer>
          </blockquote>

          <aside className="focus-credits" aria-label="Credits">
            <p>
              Architecture and vocabulary from{" "}
              <a
                className="focus-link"
                href="https://github.com/thecuriousts/ensembly/issues/1"
                target="_blank"
                rel="noopener noreferrer"
              >
                ensembly issue #1
              </a>{" "}
              and ongoing kernel work at{" "}
              <a className="focus-link" href="https://kingsparrow.space">
                kingsparrow.space
              </a>
              .
            </p>
          </aside>

          <div className="focus-page__close">
            <p>Read the spec and follow the build.</p>
            <div className="focus-page__close-actions">
              <SiteButton
                href="https://github.com/thecuriousts/ensembly/issues/1"
                variant="primary"
                size="lg"
              >
                Issue #1 — HITL &amp; HOOTL fitness
              </SiteButton>
              <SiteButton href="https://kingsparrow.space" variant="outline" size="lg">
                ensembly at kingsparrow.space
              </SiteButton>
            </div>
          </div>

          <FocusRelated
            eyebrow="Prior essay"
            href="/focus/eeaas-to-agents"
            title="From 2016 energy orchestration to 2026 agentic systems"
            detail="Why the cost of learning must fall while decision quality rises—and why that still holds when nearly all inference is remote."
          />

          <FocusRelated
            eyebrow="Memory series"
            href="/focus/memory-issue"
            title="Pulse instead of dump"
            detail="Schrödinger’s three constraints, applied to agent memory: why the harness should pulse, not flood the context window."
          />

          <FocusRelated
            eyebrow="Memory series"
            href="/focus/memory-issue/archive-not-memory"
            title="Archive is not memory"
            detail="The admissions rule: what is allowed to become a snippet at all—and why both biology and harnesses invent when the filter has no reject gate."
          />
        </article>
      </div>

      <Footer />
    </div>
  );
}
