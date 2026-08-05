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
            only when{" "}
            <strong className="focus-mark">
              the cost of the next useful observation falls while the quality of the decisions that
              observation enables rises
            </strong>
            . Today that constraint is tokens, latency, and attention—not just battery joules.
          </p>
        </header>

        <article className="focus-page__article">
          <blockquote className="focus-maxim">
            <p>
              Intelligence that respects cost and locality compounds. Intelligence that taxes
              everyone to “know everything” eventually serves almost no one.
            </p>
            <footer>Design criterion for long-lived agents</footer>
          </blockquote>

          <h2>The enduring constraint</h2>
          <p>
            In 2016 the observation was simple: smartphones are energy-constrained systems whose
            power behaviour is chaotic and multi-component.{" "}
            <em>Continuous fine-grained measurement itself consumes scarce resources.</em> The same
            physics still governs every modern AI agent stack.
          </p>
          <p>
            Context windows, tool calls, memory retrieval, model escalations, and continuous sensing
            all cost energy, latency, tokens, and money. The more an agent tries to{" "}
            <em>“know everything all the time,”</em> the more expensive it becomes. The sustainable
            path is a learning loop in which{" "}
            <strong className="focus-mark">
              the cost of acquiring the next unit of useful information falls while decision quality
              rises
            </strong>
            —so capability can widen without devouring the surplus that people actually need.
          </p>

          <h2>The original virtuous cycle</h2>
          <p>
            EEaaS argued that devices should <strong>not</strong> stream raw telemetry forever. They
            report selectively; the cloud learns which signals actually matter (
            <span className="focus-term">Key Energy Indicators</span>
            ); devices progressively report less. Monitoring overhead shrinks while power-management
            decisions improve—
            <em>meta-optimization of the measurement system itself</em>.
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
            Indicators is a set of{" "}
            <span className="focus-term">Key Decision Indicators (KDIs)</span>: the <em>minimal</em>{" "}
            observations—tool outcomes, user corrections, confidence signals, context hashes—that
            actually change future policy. Agents should start broad, then prune logging and memory
            writes as each signal class <strong>earns its keep</strong>.
          </p>
          <p>
            On-device models handle routine work. Only when local confidence is low, or a KDI
            threshold is crossed, does the agent escalate to a larger cloud model or external tool.
            Memory writes, embeddings, and re-ranking are treated as{" "}
            <strong className="focus-mark">first-class energy and token consumers</strong>:
            low-value memories compact or disappear; high-value patterns stay—and may be shared
            under privacy constraints <em>without</em> continuous centralisation of raw traces.
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
              Even when nearly all inference runs on a remote intelligence provider—say{" "}
              <strong className="focus-mark">99.99%</strong> of tokens computed on Earth or in
              space—<em>client context still matters</em>. Mobiles, laptops, IoT devices, and their
              hard limits (battery, radio, duty cycle, memory, privacy boundary, intermittent
              connectivity) are not noise around a central model; they are{" "}
              <strong className="focus-mark">the conditions under which answers must land</strong>.
              Selective signals from that edge let the provider spend server capacity where it
              changes outcomes for a person—and withhold it where more “intelligence” cannot be
              usefully absorbed.
            </p>
          </aside>

          <h2>A modern loop for long-lived agents</h2>
          <p>
            An agent system optimised for decreasing learning cost moves through four phases—each
            one a deliberate act of{" "}
            <em>making the next unit of understanding cheaper for everyone who depends on it</em>:
          </p>
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
            <strong>Scale of cost:</strong> a poorly instrumented multi-agent workflow can burn
            orders of magnitude more energy and money than a 2016 smartphone profiler—waste that
            shows up as price, latency, and exclusion. <strong>Local-first expectation:</strong>{" "}
            people want capable agents that work offline; continuous cloud dependence is expensive
            and fragile. <strong>Compounding lifetime:</strong> agents accumulate memory and policy
            over weeks; without an explicit mechanism that reduces the cost of further learning,{" "}
            <em>history itself becomes a liability</em>.
          </p>

          <h2 id="closing">Closing</h2>
          <p>
            The durable contribution of the 2016 EEaaS work is not any particular logging API. It is
            the recognition that energy-aware—and today token- and latency-aware—systems must{" "}
            <strong className="focus-mark">optimise the learning process itself</strong>.
          </p>

          <blockquote className="focus-maxim">
            <p>
              When the cost of learning falls while the quality of decisions rises, intelligence
              becomes sustainable—and therefore able to serve the greatest number of people for the
              longest time. When the opposite occurs, every additional capability collapses under
              its own observational overhead.
            </p>
            <footer>Engineered for the greatest good · not the greatest telemetry</footer>
          </blockquote>

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
