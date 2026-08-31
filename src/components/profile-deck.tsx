"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type ReactNode,
  type RefObject,
  type TouchEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  cookingItems,
  featuredProject,
  PROFILE_SLIDE_PARAM,
  type ProfileDeckSlide,
  profileDeckNav,
  profileDeckSlides,
  resolveSlideIndex,
  slideIndexById,
} from "@/data/profile-deck";
import { profileJourney } from "@/data/profile-journey";
import { lcvInteract } from "@/lib/lcv-interact";
import { motionTransition } from "@/lib/motion";
import { cn } from "./ui/utils";

const externalRel = "nofollow noreferrer noopener";

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel={externalRel} className="profile-deck__link">
      {children}
    </a>
  );
}

function TechPills({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul role="list" className="profile-deck__tech">
      {items.map((tech) => (
        <li key={tech}>
          <span className="profile-deck__tech-pill">{tech}</span>
        </li>
      ))}
    </ul>
  );
}

function splitStack(stack: string) {
  return stack
    .split(/[·•|,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function Highlights({ items }: { items: readonly string[] }) {
  if (items.length === 0) return null;
  return (
    <ul role="list" className="profile-deck__highlights">
      {items.map((point) => (
        <li key={point}>
          <span className="profile-deck__highlight-mark" aria-hidden="true" />
          <span>{point}</span>
        </li>
      ))}
    </ul>
  );
}

function LearnBand({ children }: { children: ReactNode }) {
  return (
    <div className="profile-deck__learn">
      <span className="profile-deck__learn-label">Learn</span>
      <span className="profile-deck__learn-copy">{children}</span>
    </div>
  );
}

function SlideShell({ children, cover = false }: { children: ReactNode; cover?: boolean }) {
  return (
    <div className="profile-deck__slide">
      <div className={cn("profile-deck__pane", cover && "profile-deck__pane--cover")}>
        {children}
      </div>
    </div>
  );
}

function SlideBody({
  slide,
  headingRef,
}: {
  slide: ProfileDeckSlide;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const j = profileJourney;

  switch (slide.kind) {
    case "cover": {
      const taglineLines = j.tagline
        .split(" · ")
        .map((line) => line.trim())
        .filter(Boolean);
      return (
        <SlideShell cover>
          <div className="profile-deck__arrive">
            <p className="profile-deck__handle">@{j.handle}</p>
            <h1
              ref={headingRef}
              tabIndex={-1}
              data-lcv="must-show"
              className="profile-deck__title profile-deck__title--cover"
            >
              {taglineLines.map((line, lineIndex) => (
                <span
                  key={line}
                  className={cn(
                    "profile-deck__arrive-line",
                    lineIndex > 0 && "profile-deck__arrive-line--soft"
                  )}
                >
                  {line}
                </span>
              ))}
            </h1>
            <p className="profile-deck__meta">{j.location}</p>
            <p className="profile-deck__arrive-thesis">{j.intro}</p>
            <ul role="list" className="profile-deck__arrive-beats">
              <li>friction → tools</li>
              <li>libraries → why</li>
              <li>
                side experiments → <Ext href={j.org.href}>@{j.org.name}</Ext>
              </li>
            </ul>
            <p className="profile-deck__arrive-cue" aria-hidden="true">
              Space or → to begin
            </p>
          </div>
        </SlideShell>
      );
    }

    case "story": {
      const pull = "One thing triggers the next.";
      const leadRest = j.story.lead.includes(pull)
        ? j.story.lead.replace(pull, "").replace(/\s+/g, " ").trim()
        : j.story.lead;
      return (
        <SlideShell>
          <article className="profile-deck__feature profile-deck__story">
            {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
            <h2
              ref={headingRef}
              tabIndex={-1}
              data-lcv="must-show"
              className="profile-deck__title profile-deck__title--feature"
            >
              {j.story.title}
            </h2>
            <p className="profile-deck__pull">{pull}</p>
            <ul role="list" className="profile-deck__craft-beats">
              <li>
                <span className="profile-deck__craft-beat-label">Spark</span>
                <span>on X — a thought that won’t leave</span>
              </li>
              <li>
                <span className="profile-deck__craft-beat-label">Friction</span>
                <span>from another domain, or a personal limit</span>
              </li>
              <li>
                <span className="profile-deck__craft-beat-label">Make</span>
                <span>so the constraint loses a little power</span>
              </li>
            </ul>
            <p className="profile-deck__body profile-deck__body--feature">{leadRest}</p>
            <LearnBand>Connections often show up after you move.</LearnBand>
          </article>
        </SlideShell>
      );
    }

    case "story-plan":
      return (
        <SlideShell>
          <article className="profile-deck__feature profile-deck__story">
            {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
            <h2
              ref={headingRef}
              tabIndex={-1}
              data-lcv="must-show"
              className="profile-deck__title profile-deck__title--feature"
            >
              {slide.title}
            </h2>
            <p className="profile-deck__pull profile-deck__pull--plan">
              Clarity first — then the plan goes deeper.
            </p>
            <p className="profile-deck__body profile-deck__body--feature">{j.story.body}</p>
            <LearnBand>When the field settles, energy finds its map.</LearnBand>
          </article>
        </SlideShell>
      );

    case "story-quote":
      return (
        <SlideShell cover>
          <div className="profile-deck__quote-stage">
            <h2 ref={headingRef} tabIndex={-1} className="sr-only">
              {slide.title}
            </h2>
            <p className="profile-deck__bridge">Master plan</p>
            <blockquote className="profile-deck__close-quote" data-lcv="must-show">
              {j.story.quote}
            </blockquote>
          </div>
        </SlideShell>
      );

    case "timeline": {
      const phase =
        j.story.timeline.find((row) => row.phase === slide.timelinePhase) ?? j.story.timeline[0];
      if (!phase) return null;
      return (
        <SlideShell>
          <article className="profile-deck__feature">
            {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
            <h2
              ref={headingRef}
              tabIndex={-1}
              data-lcv="must-show"
              className="profile-deck__title profile-deck__title--feature"
            >
              {phase.phase}
            </h2>
            <p className="profile-deck__body profile-deck__body--feature">{phase.html}</p>
            {phase.phase === "Pause" ? (
              <LearnBand>Paused, not abandoned — the work waited.</LearnBand>
            ) : null}
            {phase.links.length > 0 ? (
              <ul role="list" className="profile-deck__feature-links">
                {phase.links.map((link) => (
                  <li key={link.href}>
                    <Ext href={link.href}>{link.label}</Ext>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        </SlideShell>
      );
    }

    case "featured-one": {
      const project = slide.featuredSlug ? featuredProject(slide.featuredSlug) : undefined;
      if (!project) return null;
      return (
        <SlideShell>
          <article className="profile-deck__feature">
            {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
            <h2
              ref={headingRef}
              tabIndex={-1}
              data-lcv="must-show"
              className="profile-deck__title profile-deck__title--feature"
            >
              <Ext href={project.href}>{project.name}</Ext>
            </h2>
            <TechPills items={project.stack} />
            {project.links?.length ? (
              <ul role="list" className="profile-deck__feature-links">
                {project.links.map((link) => (
                  <li key={link.href}>
                    <Ext href={link.href}>{link.label}</Ext>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="profile-deck__body profile-deck__body--feature">{project.summary}</p>
            <Highlights items={project.highlights.slice(0, 3)} />
            <LearnBand>{project.learn}</LearnBand>
          </article>
        </SlideShell>
      );
    }

    case "cooking-set": {
      const items = cookingItems(slide.cookingNames ?? []);
      const item = items[0];
      if (!item) return null;
      return (
        <SlideShell>
          <article className="profile-deck__feature">
            {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
            <h2
              ref={headingRef}
              tabIndex={-1}
              data-lcv="must-show"
              className="profile-deck__title profile-deck__title--feature"
            >
              {item.href ? <Ext href={item.href}>{item.name}</Ext> : item.name}
            </h2>
            <TechPills items={splitStack(item.stack)} />
            <p className="profile-deck__body profile-deck__body--feature">{item.summary}</p>
            <Highlights items={item.highlights.slice(0, 3)} />
            <LearnBand>{item.watchFor}</LearnBand>
          </article>
        </SlideShell>
      );
    }

    case "energy-focus": {
      const focus = j.energyFocus;
      return (
        <SlideShell>
          <article className="profile-deck__feature profile-deck__story">
            {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
            <h2
              ref={headingRef}
              tabIndex={-1}
              data-lcv="must-show"
              className="profile-deck__title profile-deck__title--feature"
            >
              {focus.title}
            </h2>
            <p className="profile-deck__pull profile-deck__pull--plan">Not a project — a focus.</p>
            <p className="profile-deck__body profile-deck__body--feature">{focus.lead}</p>
            <Highlights items={focus.highlights} />
            <ul role="list" className="profile-deck__feature-links">
              <li>
                <Ext href={focus.connected.href}>{focus.connected.label}</Ext>
              </li>
            </ul>
            <LearnBand>{focus.learn}</LearnBand>
          </article>
        </SlideShell>
      );
    }

    case "pocs": {
      const poc = j.pocs[slide.pocIndex ?? 0];
      if (!poc) return null;
      return (
        <SlideShell>
          <article className="profile-deck__feature">
            {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
            <h2
              ref={headingRef}
              tabIndex={-1}
              data-lcv="must-show"
              className="profile-deck__title profile-deck__title--feature"
            >
              <Ext href={poc.href}>{poc.name}</Ext>
            </h2>
            <TechPills items={splitStack(poc.stack)} />
            {poc.liveHref ? (
              <ul role="list" className="profile-deck__feature-links">
                <li>
                  <Ext href={poc.liveHref}>Live</Ext>
                </li>
              </ul>
            ) : null}
            <p className="profile-deck__body profile-deck__body--feature">{poc.summary}</p>
            <Highlights items={poc.highlights.slice(0, 3)} />
            <LearnBand>{poc.proves}</LearnBand>
          </article>
        </SlideShell>
      );
    }

    case "long-arc":
      return (
        <SlideShell>
          <article className="profile-deck__feature profile-deck__story">
            {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
            <h2
              ref={headingRef}
              tabIndex={-1}
              data-lcv="must-show"
              className="profile-deck__title profile-deck__title--feature"
            >
              {slide.title}
            </h2>
            <p className="profile-deck__pull">Habits that outlast any single project.</p>
            <ul role="list" className="profile-deck__craft-beats">
              <li>
                <span className="profile-deck__craft-beat-label">Orchestrate</span>
                <span>under constraint — cost, locality, attention as budgets</span>
              </li>
              <li>
                <span className="profile-deck__craft-beat-label">Ship</span>
                <span>
                  more than asked when the calendar slips — deeper work, not a thin apology
                </span>
              </li>
            </ul>
            <LearnBand>Two muscles. Every project is practice.</LearnBand>
          </article>
        </SlideShell>
      );

    case "long-arc-core":
      return (
        <SlideShell>
          <article className="profile-deck__feature profile-deck__story">
            {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
            <h2
              ref={headingRef}
              tabIndex={-1}
              data-lcv="must-show"
              className="profile-deck__title profile-deck__title--feature"
            >
              {slide.title}
            </h2>
            <p className="profile-deck__pull profile-deck__pull--plan">
              Intelligence that respects cost and locality compounds.
            </p>
            <p className="profile-deck__body profile-deck__body--feature">
              An orchestrator that profiles, predicts, and acts under constraint — not “battery
              tips.” Same shape as today’s AI stack: where inference runs (cloud · edge · on-device
              NPU), what data leaves the machine, how agents spend energy and attention.
            </p>
            <Highlights
              items={[
                "Cloud · edge · on-device — place the work where the cost is honest",
                "Data locality — what leaves the machine is a deliberate choice",
                "Attention is a budget — agents that ignore it tax humans",
              ]}
            />
            <LearnBand>Blanket centralization taxes humans.</LearnBand>
          </article>
        </SlideShell>
      );

    case "long-arc-papers": {
      const [start = 0, end = j.longArc.thesisPapers.length] = slide.paperRange ?? [];
      const papers = j.longArc.thesisPapers.slice(start, end);
      return (
        <SlideShell>
          <article className="profile-deck__feature">
            {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
            <h2
              ref={headingRef}
              tabIndex={-1}
              data-lcv="must-show"
              className="profile-deck__title profile-deck__title--feature"
            >
              {slide.title}
            </h2>
            <ul role="list" className="profile-deck__cite-list profile-deck__cite-list--rich">
              {papers.map((row) => (
                <li key={row.label}>
                  <p className="profile-deck__cite-kicker">{row.label}</p>
                  {row.note ? <p className="profile-deck__cite-meta">{row.note}</p> : null}
                  <ul
                    role="list"
                    className="profile-deck__feature-links profile-deck__feature-links--wrap"
                  >
                    {row.links.map((link) => (
                      <li key={link.href}>
                        <Ext href={link.href}>{link.label}</Ext>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            {start === 0 ? <LearnBand>{j.longArc.thesisNote}</LearnBand> : null}
          </article>
        </SlideShell>
      );
    }

    case "long-arc-course":
      return (
        <SlideShell>
          <article className="profile-deck__feature">
            {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
            <h2
              ref={headingRef}
              tabIndex={-1}
              data-lcv="must-show"
              className="profile-deck__title profile-deck__title--feature"
            >
              {slide.title}
            </h2>
            <p className="profile-deck__body profile-deck__body--feature">
              {j.longArc.courseCraftNote}
            </p>
            <ul role="list" className="profile-deck__feature-links">
              {j.longArc.courseCraft.flatMap((row) =>
                row.links.map((link) => (
                  <li key={link.href}>
                    <Ext href={link.href}>{link.label}</Ext>
                  </li>
                ))
              )}
            </ul>
          </article>
        </SlideShell>
      );

    case "writing":
      return (
        <SlideShell>
          <article className="profile-deck__feature">
            {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
            <h2
              ref={headingRef}
              tabIndex={-1}
              data-lcv="must-show"
              className="profile-deck__title profile-deck__title--feature"
            >
              {slide.title}
            </h2>
            <p className="profile-deck__body profile-deck__body--feature">
              Careful long-form when stakes feel real — culture, health, tech, policy — not
              take-farming.
            </p>
            <ul role="list" className="profile-deck__cite-list profile-deck__cite-list--rich">
              <li>
                <p className="profile-deck__cite-label">
                  <Ext href={j.writing.articles.href}>{j.writing.articles.label}</Ext>
                </p>
                <p className="profile-deck__cite-meta">{j.writing.articles.detail}</p>
              </li>
              {j.writing.books.map((book) => (
                <li key={book.href}>
                  <p className="profile-deck__cite-label">
                    <Ext href={book.href}>{book.label}</Ext>
                  </p>
                  <p className="profile-deck__cite-meta">{book.detail}</p>
                </li>
              ))}
            </ul>
            <LearnBand>Read when the claim needs room — not when the feed needs noise.</LearnBand>
          </article>
        </SlideShell>
      );

    case "npm": {
      const packages =
        slide.npmYear === "2024"
          ? j.writing.npm.filter((pkg) => pkg.year === "2024")
          : j.writing.npm.filter((pkg) => pkg.year !== "2024");
      return (
        <SlideShell>
          <article className="profile-deck__feature">
            {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
            <h2
              ref={headingRef}
              tabIndex={-1}
              data-lcv="must-show"
              className="profile-deck__title profile-deck__title--feature"
            >
              {slide.title}
            </h2>
            <TechPills items={["npm", slide.npmYear === "2024" ? "2024" : "2017–2021"]} />
            <ul role="list" className="profile-deck__feature-links">
              <li>
                <Ext href={j.writing.npmProfile}>~p10ns11y</Ext>
              </li>
            </ul>
            <ul role="list" className="profile-deck__cite-list profile-deck__cite-list--rich">
              {packages.map((pkg) => (
                <li key={pkg.href} className="profile-deck__cite-row">
                  <Ext href={pkg.href}>{pkg.name}</Ext>
                  <span className="profile-deck__cite-meta">{pkg.year}</span>
                </li>
              ))}
            </ul>
            <LearnBand>Packages as receipts — small surfaces that left the laptop.</LearnBand>
          </article>
        </SlideShell>
      );
    }

    case "oss": {
      const [start = 0, end = j.openSource.length] = slide.ossRange ?? [];
      const item = j.openSource.slice(start, end)[0];
      if (!item) return null;
      return (
        <SlideShell>
          <article className="profile-deck__feature">
            {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
            <h2
              ref={headingRef}
              tabIndex={-1}
              data-lcv="must-show"
              className="profile-deck__title profile-deck__title--feature"
            >
              {item.name}
            </h2>
            <p className="profile-deck__body profile-deck__body--feature">{item.detail}</p>
            <ul
              role="list"
              className="profile-deck__feature-links profile-deck__feature-links--wrap"
            >
              {item.links.map((link) => (
                <li key={link.href}>
                  <Ext href={link.href}>{link.label}</Ext>
                </li>
              ))}
            </ul>
            <LearnBand>Personal friction → public fix.</LearnBand>
          </article>
        </SlideShell>
      );
    }

    case "connect":
      return (
        <SlideShell cover>
          {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
          <h2
            ref={headingRef}
            tabIndex={-1}
            data-lcv="must-show"
            className="profile-deck__title profile-deck__title--feature"
          >
            {slide.title}
          </h2>
          <ul role="list" className="profile-deck__phase-links profile-deck__phase-links--center">
            {j.connect.map((link) => (
              <li key={link.href}>
                <Ext href={link.href}>{link.label}</Ext>
              </li>
            ))}
          </ul>
        </SlideShell>
      );

    case "archive-intro":
      return (
        <SlideShell>
          <article className="profile-deck__feature">
            {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
            <h2
              ref={headingRef}
              tabIndex={-1}
              data-lcv="must-show"
              className="profile-deck__title profile-deck__title--feature"
            >
              {slide.title}
            </h2>
            <p className="profile-deck__body profile-deck__body--feature">{j.archive.lead}</p>
            <Highlights items={j.archive.seasons} />
            <LearnBand>
              Honest archive — kept on the map, not polished into a victory lap.
            </LearnBand>
          </article>
        </SlideShell>
      );

    case "archive-surfaces": {
      const [start = 0, end = j.archive.surfaces.length] = slide.surfaceRange ?? [];
      const surfaces = j.archive.surfaces.slice(start, end);
      return (
        <SlideShell>
          <article className="profile-deck__feature">
            {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
            <h2
              ref={headingRef}
              tabIndex={-1}
              data-lcv="must-show"
              className="profile-deck__title profile-deck__title--feature"
            >
              {slide.title}
            </h2>
            {surfaces.map((surface) => (
              <div key={surface.href} className="profile-deck__archive-row">
                <h3 className="profile-deck__oss-name">
                  <Ext href={surface.href}>{surface.name}</Ext>
                </h3>
                <p className="profile-deck__archive-meta">
                  <span className="profile-deck__tech-pill">{surface.season}</span>
                  <span className="profile-deck__archive-what">{surface.what}</span>
                </p>
              </div>
            ))}
            <LearnBand>Public writing that never left the map.</LearnBand>
          </article>
        </SlideShell>
      );
    }

    case "archive-samples": {
      const sample = j.archive.samples[slide.sampleIndex ?? 0];
      if (!sample) return null;
      return (
        <SlideShell>
          <article className="profile-deck__feature">
            <h2
              ref={headingRef}
              tabIndex={-1}
              data-lcv="must-show"
              className="profile-deck__title profile-deck__title--feature"
            >
              {slide.title}
            </h2>
            <p className="profile-deck__body profile-deck__body--feature">
              Sample posts from {sample.surface} — open any to feel the season.
            </p>
            <ul
              role="list"
              className="profile-deck__feature-links profile-deck__feature-links--wrap"
            >
              {sample.links.map((link) => (
                <li key={link.href}>
                  <Ext href={link.href}>{link.label}</Ext>
                </li>
              ))}
            </ul>
            <LearnBand>Low bandwidth · kept anyway.</LearnBand>
          </article>
        </SlideShell>
      );
    }

    case "close":
      return (
        <SlideShell cover>
          <h2
            ref={headingRef}
            tabIndex={-1}
            data-lcv="must-show"
            className="profile-deck__title profile-deck__title--feature"
          >
            {slide.title}
          </h2>
          <p className="profile-deck__close-tag">{j.footer.tagline}</p>
          <nav aria-label="Profile links" className="profile-deck__tech profile-deck__tech--center">
            {j.badges.map((badge) => (
              <a
                key={badge.href}
                href={badge.href}
                target="_blank"
                rel={externalRel}
                className="profile-deck__tech-pill"
              >
                {badge.label}
              </a>
            ))}
          </nav>
          <blockquote className="profile-deck__close-quote profile-deck__close-quote--foot">
            “{j.footer.quote}”
          </blockquote>
          <p className="profile-deck__meta">
            <Ext href={j.footer.quoteHref}>{j.footer.quoteAttribution}</Ext>
          </p>
        </SlideShell>
      );

    default:
      return null;
  }
}

export function ProfileDeck() {
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const labelId = useId();
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const slides = profileDeckSlides;
  const total = slides.length;

  const [index, setIndex] = useState(() =>
    resolveSlideIndex(searchParams.get(PROFILE_SLIDE_PARAM))
  );
  const slide = slides[index] ?? slides[0];
  const chapterMeta = profileDeckNav.find((chapter) => chapter.id === slide.chapter);
  const fromState = `slide:${slide.cue}`;
  const nextState = slides[index + 1] ? `slide:${slides[index + 1].cue}` : fromState;
  const prevState = slides[index - 1] ? `slide:${slides[index - 1].cue}` : fromState;
  const lcvStates = slides.map((entry) => `slide:${entry.cue}`).join(" ");

  const writeSlideToUrl = useCallback(
    (cue: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("view");
      if (params.get(PROFILE_SLIDE_PARAM) === cue) return;
      params.set(PROFILE_SLIDE_PARAM, cue);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const raw = searchParams.get(PROFILE_SLIDE_PARAM);
    const fromUrl = resolveSlideIndex(raw);
    setIndex(fromUrl);
    const canonicalCue = slides[fromUrl]?.cue;
    if (!canonicalCue) return;
    if (raw !== canonicalCue) writeSlideToUrl(canonicalCue);
  }, [searchParams, slides, writeSlideToUrl]);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(total - 1, next));
      const target = slides[clamped];
      if (!target) return;
      setIndex(clamped);
      writeSlideToUrl(target.cue);
    },
    [slides, total, writeSlideToUrl]
  );

  const goChapter = useCallback(
    (chapterId: string) => {
      const chapter = profileDeckNav.find((entry) => entry.id === chapterId);
      if (!chapter) return;
      const slideIndex = slideIndexById(chapter.firstSlideId);
      if (slideIndex >= 0) goTo(slideIndex);
    },
    [goTo]
  );

  const goChapterByDelta = useCallback(
    (delta: number) => {
      const chapterIndex = profileDeckNav.findIndex((entry) => entry.id === slide.chapter);
      const next = profileDeckNav[chapterIndex + delta];
      if (next) goChapter(next.id);
    },
    [goChapter, slide.chapter]
  );

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [index]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable=true]")) return;

      const onInteractive =
        Boolean(target?.closest("a, button, [role='button'], [role='link']")) &&
        !target?.closest(".profile-deck__pager, .profile-deck__toc");

      if (event.key === "[" || event.key === "]") {
        event.preventDefault();
        goChapterByDelta(event.key === "]" ? 1 : -1);
        return;
      }

      const digit = Number(event.key);
      if (!onInteractive && digit >= 1 && digit <= profileDeckNav.length) {
        event.preventDefault();
        goChapter(profileDeckNav[digit - 1].id);
        return;
      }

      if (onInteractive && (event.key === " " || event.key.startsWith("Arrow"))) return;

      if (
        event.key === "ArrowRight" ||
        event.key === "ArrowDown" ||
        event.key === "PageDown" ||
        (event.key === " " && !event.shiftKey)
      ) {
        event.preventDefault();
        goTo(index + 1);
        return;
      }
      if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowUp" ||
        event.key === "PageUp" ||
        (event.key === " " && event.shiftKey)
      ) {
        event.preventDefault();
        goTo(index - 1);
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        goTo(0);
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        goTo(total - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goChapter, goChapterByDelta, goTo, index, total]);

  const touchStartX = useRef(0);
  const onTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? 0;
  };
  const onTouchEnd = (event: TouchEvent) => {
    const endX = event.changedTouches[0]?.clientX ?? 0;
    const delta = endX - touchStartX.current;
    if (Math.abs(delta) < 48) return;
    if (delta < 0) goTo(index + 1);
    else goTo(index - 1);
  };

  return (
    <div
      className="profile-deck"
      data-lcv-machine="profile-deck"
      data-lcv-ui-state={fromState}
      data-lcv-states={lcvStates}
    >
      <div className="profile-deck__body">
        <div className="profile-deck__main">
          <section
            className="profile-deck__stage"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            aria-roledescription="slide"
            aria-labelledby={labelId}
          >
            <p id={labelId} className="sr-only" aria-live="polite">
              {chapterMeta?.label}: {slide.title}
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={slide.id}
                className="profile-deck__frame"
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                transition={motionTransition(!!shouldReduceMotion, 0.18)}
              >
                <SlideBody slide={slide} headingRef={headingRef} />
              </motion.div>
            </AnimatePresence>
          </section>

          <footer className="profile-deck__pager">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              className="profile-deck__pager-btn"
              aria-label="Previous"
              {...lcvInteract({
                event: "prev",
                from: fromState,
                success: prevState,
                fail: fromState,
                interrupted: fromState,
              })}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <p className="profile-deck__pager-label" data-lcv="must-show">
              {slide.title}
            </p>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              disabled={index === total - 1}
              className="profile-deck__pager-btn"
              aria-label="Next"
              {...lcvInteract({
                event: "next",
                from: fromState,
                success: nextState,
                fail: fromState,
                interrupted: fromState,
              })}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </footer>
        </div>

        <aside className="profile-deck__rail" aria-label="Sections">
          <nav className="profile-deck__toc">
            <ol role="list" className="profile-deck__toc-list">
              {profileDeckNav.map((chapter) => {
                const chapterActive = slide.chapter === chapter.id;
                const expanded = chapterActive && Boolean(chapter.children?.length);

                return (
                  <li
                    key={chapter.id}
                    className={cn("profile-deck__toc-chapter", chapterActive && "is-active")}
                  >
                    <button
                      type="button"
                      onClick={() => goChapter(chapter.id)}
                      aria-expanded={chapter.children?.length ? expanded : undefined}
                      aria-current={chapterActive && !chapter.children?.length ? "true" : undefined}
                      className="profile-deck__toc-chapter-btn"
                      {...lcvInteract({
                        event: "go-chapter",
                        from: fromState,
                        success: `slide:${slides[slideIndexById(chapter.firstSlideId)]?.cue ?? slide.cue}`,
                        fail: fromState,
                        interrupted: fromState,
                      })}
                    >
                      {chapter.label}
                    </button>
                    {expanded ? (
                      <ol role="list" className="profile-deck__toc-nested">
                        {chapter.children?.map((child, childIndex) => {
                          const start = slideIndexById(child.firstSlideId);
                          const nextChild = chapter.children?.[childIndex + 1];
                          const end = nextChild
                            ? slideIndexById(nextChild.firstSlideId)
                            : slides.reduce(
                                (last, entry, entryIndex) =>
                                  entry.chapter === chapter.id ? entryIndex + 1 : last,
                                start + 1
                              );
                          const nestedActive = index >= start && index < end;
                          return (
                            <li key={child.firstSlideId}>
                              <button
                                type="button"
                                onClick={() => goTo(start)}
                                aria-current={nestedActive ? "true" : undefined}
                                className={cn(
                                  "profile-deck__toc-nested-btn",
                                  nestedActive && "is-active"
                                )}
                                {...lcvInteract({
                                  event: "go-slide",
                                  from: fromState,
                                  success: `slide:${slides[start]?.cue ?? slide.cue}`,
                                  fail: fromState,
                                  interrupted: fromState,
                                })}
                              >
                                {child.label}
                              </button>
                            </li>
                          );
                        })}
                      </ol>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </nav>
          <Link
            href="/profile?view=scroll"
            className="profile-deck__full-page"
            {...lcvInteract({
              event: "navigate",
              from: fromState,
              success: "/profile?view=scroll",
              fail: fromState,
              interrupted: fromState,
            })}
          >
            Full page
          </Link>
        </aside>
      </div>
    </div>
  );
}
