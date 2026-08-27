import Link from "next/link";
import { FocusFigure } from "@/components/focus/focus-figure";
import { FocusRelated } from "@/components/focus/focus-related";
import { FocusSeriesNav } from "@/components/focus/focus-series-nav";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SiteButton } from "@/components/site/SiteButton";

export default function MemoryIssuePage() {
  return (
    <div className="focus-page min-h-screen">
      {/*
        THESIS: Agent memory should pulse (sparse, event-driven, verified) instead of dump.
        OWN-WORLD: Same Focus editorial tokens; series nav back to /focus.
        STORY: Schrödinger’s three constraints → AI stack → dump failure → pulse contract + example.
        FIRST VIEWPORT: Title + lede + series crumb to /focus.
        FORM: Nested Focus essay; diagrams as figures; pulse as a definition list.
        FINISH: polish + PR; type-check/lint green.
      */}
      <Header />

      <div className="focus-page__shell">
        <header className="focus-page__intro">
          <FocusSeriesNav current="memory-issue" />
          <h1 className="focus-page__title">Pulse instead of dump</h1>
          <p className="focus-page__lede">
            Schrödinger’s three constraints, applied to agent memory. The harness cannot change the
            foundation model or the raw hardware. It <strong className="focus-mark">can</strong>{" "}
            change how it talks to memory: a compact pulse instead of a context dump.
          </p>
        </header>

        <article className="focus-page__article">
          <blockquote className="focus-maxim">
            <p>
              Do not flood the runtime with memory. Connect it with fast, sparse, event-driven
              signals.
            </p>
            <footer>A contract between harness and store</footer>
          </blockquote>

          <h2>Three constraints, 1944</h2>
          <p>
            Most discussions of agent architecture start with models, tools, or prompts. A more
            useful starting point is three constraints that any system—biological or artificial—must
            satisfy if it is going to stay ordered, remember anything reliably, and keep running.
            Erwin Schrödinger laid them out in <cite>What Is Life?</cite>.
          </p>
          <ol className="focus-page__phases">
            <li>
              <strong>Averaging</strong>
              <span>
                Reliable behaviour at scale comes from large numbers. Individual events are noisy;
                the relative error shrinks as{" "}
                <span className="focus-formula">
                  1/√<var>n</var>
                </span>
                .
              </span>
            </li>
            <li>
              <strong>High-barrier states</strong>
              <span>
                Information that must persist cannot rely on averaging alone. A gene stays intact
                because the energy required to change it dwarfs the thermal noise around it.
                Schrödinger called the resulting structure an{" "}
                <span className="focus-term">aperiodic crystal</span>: ordered but non-repeating,
                able to store a code.
              </span>
            </li>
            <li>
              <strong>Open thermodynamic engine</strong>
              <span>
                The whole system imports free energy and exports entropy (heat). If that flow stops
                or becomes inefficient, order collapses.
              </span>
            </li>
          </ol>

          <FocusFigure
            src="/images/IA_three_constraints.svg"
            alt="Diagram mapping Schrödinger’s three constraints—averaging, high-barrier states, and an open engine—onto statistical, stability, and thermodynamic layers of an AI stack"
            caption="The same three constraints, almost unchanged, in an intelligence stack: scale, discrete memory, and the heat of inference."
            width={800}
            height={520}
          />

          <h2>The same physics in the stack</h2>
          <p>
            The statistical layer is pre-training and scale: more data and parameters produce more
            reliable generalisations, the way a large number of molecules produces a reliable gas
            law.
          </p>
          <p>
            The stability layer is the discrete representations—tokens, embeddings, weights, and any
            external memory we attach. These are the aperiodic crystal. They work only while the
            barriers around useful states stay high.
          </p>
          <p>
            The thermodynamic layer is compute and inference: tokens processed, energy spent, heat
            generated. An agent that constantly re-processes stale or irrelevant context is a cell
            with leaky mitochondria.
          </p>
          <p>
            Users and developers of agents cannot change the first layer (the foundation model’s
            training run) or the raw hardware of the third. They{" "}
            <strong className="focus-mark">can</strong> change the harness—the environment the model
            runs inside—and especially how that harness talks to memory.
          </p>

          <h2>
            Dumping is the wrong <var>n</var>
          </h2>
          <p>
            Current practice mostly ignores the constraints. We dump large slices of memory into the
            context window. That increases{" "}
            <span className="focus-formula">
              <var>n</var>
            </span>{" "}
            in the wrong direction: more tokens, more noise, more averaging over irrelevance. It
            also burns energy on tokens the model did not need and lowers the effective barriers
            around the facts that actually matter. Hallucinations and “lost in the middle” are the
            predictable results.
          </p>
          <p>
            This is the agentic form of streaming raw telemetry forever—the failure mode of the{" "}
            <Link className="focus-link" href="/focus">
              Focus essay
            </Link>
            . There, the durable idea is that the cost of the next useful observation must fall
            while decision quality rises. Dumping memory is the opposite: observational overhead
            grows with history until history itself becomes a liability.
          </p>

          <FocusFigure
            src="/images/IA_dump_vs_pulse.svg"
            alt="Side-by-side diagram contrasting a flooded context dump with a sparse pulse that injects a surgical snippet and prefetches the next slice"
            caption="Dump grows n in the wrong direction. Pulse keeps the working set small and the barriers around useful facts high."
            width={860}
            height={500}
          />

          <h2>A pulse, then a surgical snippet</h2>
          <p>
            A better pattern follows directly from the three principles. Do not flood the runtime
            with memory. Connect the live harness to memory (local or cloud) with fast, sparse,
            event-driven signals. When the runtime needs something, it emits a compact pulse. Memory
            traverses only the relevant slice and injects a surgical snippet. The return signal can
            immediately queue the next likely traversal so the following context is already
            prepared.
          </p>
          <p>
            The working set stays small. The statistical average the model performs contains less
            noise. The discrete fragments that arrive are closer to verified, high-barrier states.
            The energy cost per step drops because the runtime is not forced to re-read the entire
            history on every token.
          </p>
          <p>
            This is not a new model. It is a different contract between runtime and memory:{" "}
            <strong className="focus-mark">pulse instead of dump</strong>.
          </p>

          <h2>One concrete pulse</h2>
          <p>
            Imagine a long-running apply agent. The user asks: does this draft still match the xAI
            constraints we locked last Tuesday?
          </p>
          <p>
            Dump: paste thirty-eight thousand tokens of chat, tool traces, and prior CVs into the
            window. The model averages over irrelevance. The locked constraint is somewhere in the
            middle.
          </p>
          <p>Pulse: the runtime emits a compact tool-call signal, not a transcript.</p>
          <dl className="focus-pulse">
            <div>
              <dt>retrieval key</dt>
              <dd>
                <code>apply/xai/constraints</code>
              </dd>
            </div>
            <div>
              <dt>verification flag</dt>
              <dd>
                inject only if the fragment still hashes to the locked revision—a high-barrier
                check, not a vibe
              </dd>
            </div>
            <div>
              <dt>prefetch</dt>
              <dd>
                <code>apply/xai/projects</code> — the next likely traversal, already warming
              </dd>
            </div>
          </dl>
          <p>
            Memory walks that slice, returns roughly 120 verified tokens, and queues the projects
            fragment. The working set stays small. The following tool call does not start cold.
          </p>

          <FocusFigure
            src="/images/IA_memory_pulse.svg"
            alt="Sequence diagram of a memory pulse: live harness emits a compact signal with key, verify, and prefetch; memory returns a surgical snippet and queues the next slice"
            caption="Tool-call signal, retrieval key, verification flag: sparse packets, not a nucleus flooded with every molecule."
            width={840}
            height={500}
          />

          <h2>Who this is for</h2>
          <p>
            The problem is interesting for developers and mid-sized labs precisely because the large
            labs can keep stretching context windows and paying the token tax. Everyone else is
            constrained by cost, latency, and the reliability of long-running agents. A clean
            pulsive protocol sits at the intersection of the two layers they can actually
            control—the harness, and memory.
          </p>
          <p>
            Solving the signal design and the prefetch logic well would produce better agents
            without another 10× pre-training run.
          </p>

          <aside className="focus-aside" aria-label="Biology already solved a version of this">
            <p>
              Cells do not pour every possible molecule into the nucleus. They use sparse,
              high-signal packets. The same logic applies to the harness.
            </p>
          </aside>

          <h2 id="closing">Closing</h2>
          <p>
            The{" "}
            <Link className="focus-link" href="/focus">
              Focus essay
            </Link>{" "}
            argued that intelligence stays viable only when the cost of the next useful observation
            falls while the quality of the decisions that observation enables rises. Memory is where
            that constraint becomes operational. Selective signals—Key Decision Indicators in that
            essay, pulses here—are the same move: report less, decide better.
          </p>

          <blockquote className="focus-maxim">
            <p>
              Pulse instead of dump. Keep the working set small, the barriers high, and the heat
              spent on tokens that can still change a decision.
            </p>
            <footer>Engineered for the greatest good · not the greatest context window</footer>
          </blockquote>

          <aside className="focus-credits" aria-label="Credits">
            <p>
              Schrödinger framing prompted by{" "}
              <a
                className="focus-link"
                href="https://x.com/the_no_mind/status/2092243961935020284"
                target="_blank"
                rel="noopener noreferrer"
              >
                @the_no_mind
              </a>
              ’s thread on <cite>What Is Life?</cite>. This argument on{" "}
              <a
                className="focus-link"
                href="https://x.com/Peramanathan/status/2092840880751415412"
                target="_blank"
                rel="noopener noreferrer"
              >
                X
              </a>
              .
            </p>
          </aside>

          <div className="focus-page__close">
            <p>
              The parent essay maps the 2016 energy-orchestration loop onto 2026 agents, including
              the short white paper.
            </p>
            <div className="focus-page__close-actions">
              <SiteButton href="/focus" variant="primary" size="lg">
                Read the Focus essay
              </SiteButton>
              <SiteButton href="/focus?paper=view" variant="outline" size="lg">
                Open the white paper
              </SiteButton>
              <SiteButton
                href="https://x.com/Peramanathan/status/2092840880751415412"
                variant="outline"
                size="lg"
              >
                This argument on X
              </SiteButton>
            </div>
          </div>

          <FocusRelated
            eyebrow="In this series"
            href="/focus"
            title="From 2016 energy orchestration to 2026 agentic systems"
            detail="Why the cost of learning must fall while decision quality rises—and why that still holds when nearly all inference is remote."
          />
        </article>
      </div>

      <Footer />
    </div>
  );
}
