import Link from "next/link";

const FIGURE_SRC = "/skins/colorfigures/hire-desk.html?embed=1";

/**
 * Research skin figure: a hand-inked isometric hire desk you can turn,
 * with a working card press. Sits below the hero so first-screen must-show
 * marks are unchanged. Credit and MIT notice stay visible.
 */
export function HireColorfiguresFigure() {
  return (
    <section
      id="colorfigures-skin"
      data-section="colorfigures-skin"
      className="hire-phi__section hire-cf__section"
      aria-labelledby="hire-cf-heading"
    >
      <div className="phi-route-band hire-phi__cluster">
        <header className="hire-phi__section-header">
          <h2 id="hire-cf-heading" className="hire-phi__section-title">
            Research skin
          </h2>
          <p className="hire-phi__section-lead">
            A Colorfigures desk you can turn. Load a card, press the lever, and look inside. Layout
            invariants on this page are the same as the default hire surface.{" "}
            <Link href="/">Back to the default look</Link>.
          </p>
        </header>
        <div className="hire-cf__frame-wrap">
          {/* Same-origin static figure. sandbox is defence in depth: scripts must
              run the press, and same-origin lets the figure read its own ?embed=
              params. The pair cannot stop a hostile same-origin script, but this
              file is ours. The MIT notice stays on the parent, not in the frame. */}
          <iframe
            className="hire-cf__frame"
            title="Hire desk, a hand-inked isometric card press"
            src={FIGURE_SRC}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
        <p className="hire-cf__credit">
          Figure made with <a href="https://april-zhu.com/colorfigures">Colorfigures</a> (MIT) by
          April Zhu, built on iso-glow and iso-figure by Tolga Cohce. See-through views follow
          Anatomy by Ryan (MIT). Licence notice:{" "}
          <a href="/skins/colorfigures/LICENSE">MIT licence</a>.
        </p>
      </div>
    </section>
  );
}
