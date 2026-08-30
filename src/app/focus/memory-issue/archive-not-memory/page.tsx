import Link from "next/link";
import { FocusFigure } from "@/components/focus/focus-figure";
import { FocusRelated } from "@/components/focus/focus-related";
import { FocusSeriesNav } from "@/components/focus/focus-series-nav";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SiteButton } from "@/components/site/SiteButton";

export default function ArchiveNotMemoryPage() {
  return (
    <div className="focus-page min-h-screen">
      {/*
        THESIS: Archive is not memory — admissions rule for what may pulse back in.
        OWN-WORLD: Same Focus editorial tokens; series nav through memory essays.
        STORY: Four blurred traces → archive/memory split → admissions test → invention → locks.
        FIRST VIEWPORT: Title + lede + follow-up crumb to Pulse instead of dump.
        FORM: Nested Focus essay; diagrams as figures; distinctions as phases list.
        FINISH: polish + PR; type-check/lint green.
      */}
      <Header />

      <div className="focus-page__shell">
        <header className="focus-page__intro">
          <FocusSeriesNav current="memory-issue" memoryEssay="archive-not-memory" />
          <h1 className="focus-page__title">Archive is not memory</h1>
          <p className="focus-page__lede">
            A follow-up to{" "}
            <Link className="focus-link" href="/focus/memory-issue">
              <em>Pulse instead of dump</em>
            </Link>
            . The first essay was about traffic. This one is the second constraint: what is allowed
            to become a snippet at all?
          </p>
        </header>

        <article className="focus-page__article">
          <blockquote className="focus-maxim">
            <p>
              The archive may be large. The memory that enters the harness must stay sparse, dated,
              sourced, and allowed to remain incomplete.
            </p>
            <footer>Admissions rule for agent recall</footer>
          </blockquote>

          <h2>Four things that look alike in a log</h2>
          <p>
            Most stacks blur four things that only look alike once they sit in a log. The form is
            not what makes it memory. <strong className="focus-mark">Reuse is.</strong>
          </p>
          <ol className="focus-page__phases">
            <li>
              <strong>Data</strong>
              <span>
                What existed. Logs, tickets, embeddings—residue that may never move an outcome.
              </span>
            </li>
            <li>
              <strong>Context</strong>
              <span>
                What is loaded now. The working set in the window, not a claim about the past.
              </span>
            </li>
            <li>
              <strong>Fact</strong>
              <span>
                A claim treated as currently true. It can sit in a store forever and still never
                change a decision.
              </span>
            </li>
            <li>
              <strong>Memory</strong>
              <span>
                A past trace kept because it is expected to change a later action. Retention for
                leverage, not completeness.
              </span>
            </li>
          </ol>
          <p>
            A full project history can reconstruct the journey and still be the wrong thing to
            inject. If everything since the beginning counts as memory, the harness is dumping
            again.
          </p>

          <FocusFigure
            src="/images/IA_four_traces.svg"
            alt="Diagram distinguishing data, context, fact, and memory: four traces that look alike in a log but only reuse makes it memory"
            caption="Data, context, fact, memory—they blur in a transcript. Only traces kept for reuse earn the name."
            width={860}
            height={560}
          />

          <h2>Biology never needed the extra word</h2>
          <p>
            Retention was already selection. Keeping a trace cost energy. Recalling it cost more.
            What persisted <em>was</em> memory. There was no cheap warehouse beside the cell.
          </p>
          <p>
            AI harnesses broke that identity. Logs, transcripts, tickets, and embeddings are almost
            free to keep. Residue accumulates. Then the live model is asked to treat residue as
            recall. Effectiveness requires a split the organism never had to name:
          </p>
          <p>
            <strong className="focus-mark">Archive stays outside the live path.</strong>{" "}
            <strong className="focus-mark">
              Memory is only the traces allowed to pulse back in when they can change the next
              action.
            </strong>
          </p>
          <p>
            Without that split, the harness cannot tell a useful trace from a complete one.{" "}
            <Link className="focus-link" href="/focus/memory-issue">
              Pulse instead of dump
            </Link>{" "}
            was the traffic rule. This is the admissions rule.
          </p>

          <FocusFigure
            src="/images/IA_archive_vs_memory.svg"
            alt="Side-by-side diagram: archive stays outside the live path while memory is sparse traces allowed to pulse back when they can change the next action"
            caption="Cheap storage broke the identity between keeping and recalling. Archive is residue; memory is leverage."
            width={860}
            height={560}
          />

          <h2>The admissions test</h2>
          <p>
            The test is not &ldquo;did it happen?&rdquo; The test is:{" "}
            <strong className="focus-mark">
              would this past trace change the next action enough to justify bringing it back?
            </strong>
          </p>
          <p>If yes, it is memory. If no, it is residual data.</p>
          <p>
            That filter also explains why both systems invent. Neither is a recording. Both are
            asked for a complete next move while the trace is incomplete. Coherence is cheaper than
            &ldquo;I don&rsquo;t know.&rdquo; Under that pressure the gap fills, and the fill can be
            promoted into a high-barrier state.
          </p>

          <FocusFigure
            src="/images/IA_admissions_test.svg"
            alt="Flow diagram of the admissions test: would this past trace change the next action enough to justify bringing it back—yes becomes memory, no stays residual data"
            caption="Not did it happen—would it change the next action? The dangerous state is a completed story the filter failed to reject."
            width={860}
            height={560}
          />

          <h2>Biology fills under suggestion</h2>
          <p>
            Biology fills under suggestion, leading questions, repeated imagination, fatigue,
            threat, and the need to please or escape. Source drops away. What was heard later feels
            like what was seen. What was pictured feels like what was done. Confidence arrives after
            the story is complete, not because the trace was good.
          </p>

          <h2>The harness fills under the same shape of pressure</h2>
          <p>
            Training punishes abstention. Extraction compresses a long turn and keeps the fluent
            claim while dropping the correction. Old constraints stay &ldquo;relevant&rdquo; after
            they have been withdrawn. Generated text, retrieved text, and a user belief look the
            same on the next pulse. A one-turn invention becomes durable because the write path had
            no lock.
          </p>
          <p>
            The dangerous state in both cases is not a plan to deceive. It is a completed story that
            the filter failed to reject.
          </p>
          <p>
            <strong className="focus-mark">
              Truthfulness is not more monitoring. It is a higher bar inside monitoring and
              filtering themselves.
            </strong>{" "}
            Restore the ability to refuse a fluent option before it is promoted—not the ability to
            collect more of them.
          </p>

          <aside className="focus-aside" aria-label="Certainty is cheap after coherence">
            <p>
              Certainty is cheap after coherence. Accuracy needs a check—and permission to leave the
              story incomplete.
            </p>
          </aside>

          <h2>Locks for a nervous system</h2>
          <p>
            For a nervous system that means safety before recall, not extra rehearsal. Sleep and
            rest restore the ability to reject a wrong option, not only the ability to produce more
            detail. Free recall before questions. No pressure to finish the scene. A cinematic
            interrogation does the opposite: heat, leading questions, a demand for a complete story.
            It can extract a confession. It cannot raise the bar. The work that actually costs is
            slower: field traces, timestamps, other witnesses, contemporaneous notes kept as
            archive—not as fuel for a more vivid reconstruction. Separate sources on purpose: seen,
            heard, imagined, told later. Do not rehearse an unverified version until it feels real.
          </p>

          <h2>Locks for the harness</h2>
          <p>
            For the harness, those locks have to be protocol—the same reject gate, not a thicker
            log.
          </p>
          <dl className="focus-pulse">
            <div>
              <dt>Write only after a check</dt>
              <dd>
                A generated sentence is a hypothesis. It becomes memory only with source, time, and
                status: user-stated, tool-verified, inferred, or unknown.
              </dd>
            </div>
            <div>
              <dt>Archive vs index</dt>
              <dd>
                Keep raw logs as archive and summaries as a cheap index. If the summary cannot
                justify the next action, escalate to the immutable log and write back only the
                grounded slice.
              </dd>
            </div>
            <div>
              <dt>Belief vs locked truth</dt>
              <dd>
                Split what the user believes from what is locked true. A stored misconception with
                the correction discarded is sycophancy waiting for the next retrieve.
              </dd>
            </div>
            <div>
              <dt>Freshness, not only similarity</dt>
              <dd>
                Relevance can fetch a constraint that was later revoked. Supersession is a different
                signal from nearness.
              </dd>
            </div>
            <div>
              <dt>Permission to abstain</dt>
              <dd>
                Allow &ldquo;not in the evidence.&rdquo; If abstention is illegal, the model fills,
                and the fill gets saved.
              </dd>
            </div>
            <div>
              <dt>Gate inferred writes</dt>
              <dd>
                Provenance, edit, and delete are part of truthfulness. Keep the working set small.
                Truth decays when the runtime averages over stale, conflicting, and near-miss
                traces.
              </dd>
            </div>
          </dl>

          <FocusFigure
            src="/images/IA_three_locks.svg"
            alt="Diagram of three locks for truthfulness: source where this came from, time when it was true and whether withdrawn, uncertainty permission not to complete the story"
            caption="Source, time, uncertainty. The same reject gate serves biology and harness: quality in the filter, not more observation."
            width={860}
            height={560}
          />

          <h2 id="closing">Closing</h2>
          <p>
            <Link className="focus-link" href="/focus/memory-issue">
              Pulse instead of dump
            </Link>{" "}
            was the traffic rule: do not flood the runtime. This is the admissions rule: the archive
            may be large, but the memory that enters the harness must stay sparse, dated, sourced,
            and allowed to remain incomplete. That is how a trace keeps leverage on the outcome
            instead of becoming another fluent lie with nowhere left to doubt.
          </p>

          <blockquote className="focus-maxim">
            <p>
              Pulse instead of dump was the traffic rule. This is the admissions rule. Sparse,
              sourced, dated—and allowed to stay incomplete.
            </p>
            <footer>Engineered for leverage · not for a complete story</footer>
          </blockquote>

          <div className="focus-page__close">
            <p>
              Read the first essay on Schrödinger&rsquo;s constraints and the pulse contract between
              runtime and memory.
            </p>
            <div className="focus-page__close-actions">
              <SiteButton href="/focus/memory-issue" variant="primary" size="lg">
                Pulse instead of dump
              </SiteButton>
              <SiteButton href="/focus/eeaas-to-agents" variant="outline" size="lg">
                EEaaS to agents
              </SiteButton>
            </div>
          </div>

          <FocusRelated
            eyebrow="Previous in series"
            href="/focus/memory-issue"
            title="Pulse instead of dump"
            detail="Schrödinger’s three constraints, applied to agent memory: why the harness should pulse, not flood the context window."
          />
        </article>
      </div>

      <Footer />
    </div>
  );
}
