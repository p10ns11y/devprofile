import type { Metadata } from "next";
import { Suspense } from "react";
import { FocusWhitepaperModal } from "@/components/focus/focus-whitepaper-modal";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SiteButton } from "@/components/site/SiteButton";
import "@/styles/focus.css";

export const metadata: Metadata = {
  title: "Focus — From EEaaS to Agentic Systems",
  description:
    "Why the cost of learning must decrease while decision quality increases — from 2016 energy orchestration to 2026 AI agents.",
};

function FocusFigure({
  src,
  alt,
  caption,
  width,
  height,
}: {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}) {
  return (
    <figure className="focus-figure">
      <div className="focus-figure__frame">
        <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export default function FocusPage() {
  return (
    <div className="focus-page min-h-screen">
      {/*
        THESIS: Learning cost must fall while decision quality rises — refuse “know everything always.”
        OWN-WORLD: Site brand tokens, Instrument display + DM Sans body, editorial measure, diagram frames.
        STORY: Visitor grasps EEaaS→agents continuity, sees the three loops, opens the white paper inline.
        FIRST VIEWPORT: Title + lede; PDF opens via closing CTA (?paper=view modal).
        FORM: Read essay inside established portfolio world (narrow extension; no new brand system).
        FINISH: polish + PR; detector clean; type-check/lint green.
      */}
      <Header />

      <div className="focus-page__shell">
        <header className="focus-page__intro">
          <h1 className="focus-page__title">
            From 2016 energy orchestration to 2026 agentic systems
          </h1>
          <p className="focus-page__lede">
            The durable idea behind Energy Efficiency as a Service still holds: systems stay viable
            only when the cost of the next useful observation falls while the quality of the
            decisions that observation enables rises. Today that constraint is tokens, latency, and
            attention—not just battery joules.
          </p>
        </header>

        <article className="focus-page__article">
          <h2>The enduring constraint</h2>
          <p>
            In 2016 the observation was simple: smartphones are energy-constrained systems whose
            power behaviour is chaotic and multi-component. Continuous fine-grained measurement
            itself consumes scarce resources. The same physics still governs every modern AI agent
            stack.
          </p>
          <p>
            Context windows, tool calls, memory retrieval, model escalations, and continuous sensing
            all cost energy, latency, tokens, and money. The more an agent tries to “know everything
            all the time,” the more expensive it becomes. The sustainable path is a learning loop in
            which the cost of acquiring the next unit of useful information falls while decision
            quality rises.
          </p>

          <h2>The original virtuous cycle</h2>
          <p>
            EEaaS argued that devices should not stream raw telemetry forever. They report
            selectively; the cloud learns which signals actually matter (Key Energy Indicators);
            devices progressively report less. Monitoring overhead shrinks while power-management
            decisions improve—meta-optimization of the measurement system itself.
          </p>

          <FocusFigure
            src="/images/IA_the_virtuous_loop.svg"
            alt="Diagram of the virtuous loop: measure, learn importance, reduce measurement, improve decisions, repeat"
            caption="The virtuous loop: measure → learn importance → reduce measurement → improve decisions → repeat."
            width={700}
            height={499}
          />

          <h2>Mapping onto agent workflows</h2>
          <p>
            That principle maps cleanly onto today’s runtimes. A 2026 equivalent of Key Energy
            Indicators is a set of Key Decision Indicators (KDIs): the minimal observations—tool
            outcomes, user corrections, confidence signals, context hashes—that actually change
            future policy. Agents should start broad, then prune logging and memory writes as each
            signal class earns its keep.
          </p>
          <p>
            On-device models handle routine work. Only when local confidence is low, or a KDI
            threshold is crossed, does the agent escalate to a larger cloud model or external tool.
            Memory writes, embeddings, and re-ranking are treated as first-class energy and token
            consumers: low-value memories compact or disappear; high-value patterns stay—and may be
            shared under privacy constraints without continuous centralisation of raw traces.
          </p>

          <FocusFigure
            src="/images/IA_stack.svg"
            alt="Diagram of a layered local-to-cloud intelligence stack with selective escalation"
            caption="Local-first stack with learned escalation: most work stays near the device; costlier layers fire only when KDIs demand it."
            width={870}
            height={546}
          />

          <aside className="focus-aside" aria-label="Note on server-side inference">
            <p>
              Even when nearly all inference runs on a remote intelligence provider—say 99.99% of
              tokens computed on Earth or in space—client context still matters. Mobiles, laptops,
              IoT devices, and their hard limits (battery, radio, duty cycle, memory, privacy
              boundary, intermittent connectivity) are not noise around a central model; they are
              the conditions under which answers must land. Selective signals from that edge—device
              class, thermal headroom, link quality, what the user just accepted or rejected—let the
              provider spend server capacity where it changes outcomes, and withhold it where the
              client cannot usefully absorb more intelligence.
            </p>
          </aside>

          <h2>A modern loop for long-lived agents</h2>
          <p>An agent system optimised for decreasing learning cost moves through four phases:</p>
          <ol className="focus-page__phases">
            <li>
              <strong>Broad but cheap observation</strong>
              <span>
                Wide, low-resolution signals: tool success/failure, latency buckets, accept/reject,
                local confidence.
              </span>
            </li>
            <li>
              <strong>Importance learning</strong>
              <span>
                Offline or low-priority analysis ranks signals by contribution to decision quality.
              </span>
            </li>
            <li>
              <strong>Policy tightening</strong>
              <span>
                Logging, memory write, and escalation rules focus on high-value signals; budgets
                shrink.
              </span>
            </li>
            <li>
              <strong>Continuous but sparse improvement</strong>
              <span>
                Edge cases still get richer traces, but steady-state learning cost keeps falling
                while average decision quality rises.
              </span>
            </li>
          </ol>

          <FocusFigure
            src="/images/IA_local_orchestrator_loop.svg"
            alt="Diagram of a local orchestrator loop profiling, predicting, and acting under constraint"
            caption="Local orchestrator loop: profile, predict, and act under constraint—intelligence that respects cost and locality."
            width={912}
            height={580}
          />

          <h2>Why the principle is more urgent now</h2>
          <p>
            Scale of cost: a poorly instrumented multi-agent workflow can burn orders of magnitude
            more energy and money than a 2016 smartphone profiler. Local-first expectation: users
            want capable agents that work offline; continuous cloud dependence is expensive and
            fragile. Compounding lifetime: agents accumulate memory and policy over weeks; without
            an explicit mechanism that reduces the cost of further learning, history itself becomes
            a liability.
          </p>

          <h2 id="closing">Closing</h2>
          <p>
            The durable contribution of the 2016 EEaaS work is not any particular logging API. It is
            the recognition that energy-aware—and today token- and latency-aware—systems must
            optimise the learning process itself. When the cost of learning falls while decision
            quality rises, the system becomes sustainable. When the opposite occurs, every
            additional capability eventually collapses under its own observational overhead.
          </p>

          <div className="focus-page__close">
            <p>
              Full short white paper, with the complete argument and references to the Uppsala
              thesis.
            </p>
            <div className="focus-page__close-actions">
              <SiteButton href="?paper=view" variant="primary" size="lg">
                Open EEaaS agents white paper (PDF)
              </SiteButton>
            </div>
          </div>
        </article>
      </div>

      <Footer />
      <Suspense fallback={null}>
        <FocusWhitepaperModal />
      </Suspense>
    </div>
  );
}
