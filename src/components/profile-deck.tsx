"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
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
  type ProfileDeckSlide,
  profileDeckNav,
  profileDeckSlides,
  slideIndexById,
} from "@/data/profile-deck";
import { profileJourney } from "@/data/profile-journey";
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
    case "cover":
      return (
        <SlideShell cover>
          <p className="profile-deck__handle">@{j.handle}</p>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="profile-deck__title profile-deck__title--cover"
          >
            {j.tagline}
          </h1>
          <p className="profile-deck__meta">{j.location}</p>
          <p className="profile-deck__body profile-deck__body--feature">{j.intro}</p>
        </SlideShell>
      );

    case "story":
      return (
        <SlideShell>
          <article className="profile-deck__feature">
            {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="profile-deck__title profile-deck__title--feature"
            >
              {j.story.title}
            </h2>
            <p className="profile-deck__body profile-deck__body--feature">{j.story.lead}</p>
          </article>
        </SlideShell>
      );

    case "story-plan":
      return (
        <SlideShell>
          <article className="profile-deck__feature">
            {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="profile-deck__title profile-deck__title--feature"
            >
              {slide.title}
            </h2>
            <p className="profile-deck__body profile-deck__body--feature">{j.story.body}</p>
          </article>
        </SlideShell>
      );

    case "story-quote":
      return (
        <SlideShell cover>
          <h2 ref={headingRef} tabIndex={-1} className="sr-only">
            {slide.title}
          </h2>
          <blockquote className="profile-deck__close-quote">{j.story.quote}</blockquote>
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
              className="profile-deck__title profile-deck__title--feature"
            >
              {item.href ? <Ext href={item.href}>{item.name}</Ext> : item.name}
            </h2>
            <TechPills items={splitStack(item.stack)} />
            <LearnBand>{item.watchFor}</LearnBand>
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
            <LearnBand>{poc.proves}</LearnBand>
          </article>
        </SlideShell>
      );
    }

    case "long-arc":
      return (
        <SlideShell>
          <article className="profile-deck__feature">
            {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="profile-deck__title profile-deck__title--feature"
            >
              {slide.title}
            </h2>
            <p className="profile-deck__body profile-deck__body--feature">{j.longArc.lead}</p>
          </article>
        </SlideShell>
      );

    case "long-arc-core":
      return (
        <SlideShell>
          <article className="profile-deck__feature">
            {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="profile-deck__title profile-deck__title--feature"
            >
              {slide.title}
            </h2>
            <p className="profile-deck__body profile-deck__body--feature">{j.longArc.core}</p>
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
              className="profile-deck__title profile-deck__title--feature"
            >
              {slide.title}
            </h2>
            <ul role="list" className="profile-deck__cite-list">
              {papers.map((row) => (
                <li key={row.label}>
                  <p className="profile-deck__cite-label">{row.label}</p>
                  <ul role="list" className="profile-deck__feature-links">
                    {row.links.map((link) => (
                      <li key={link.href}>
                        <Ext href={link.href}>
                          {link.label.length > 42 ? `${link.label.slice(0, 40)}…` : link.label}
                        </Ext>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
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
              className="profile-deck__title profile-deck__title--feature"
            >
              {slide.title}
            </h2>
            <ul role="list" className="profile-deck__cite-list">
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
              className="profile-deck__title profile-deck__title--feature"
            >
              {slide.title}
            </h2>
            <ul role="list" className="profile-deck__feature-links">
              <li>
                <Ext href={j.writing.npmProfile}>~p10ns11y</Ext>
              </li>
            </ul>
            <ul role="list" className="profile-deck__cite-list">
              {packages.map((pkg) => (
                <li key={pkg.href} className="profile-deck__cite-row">
                  <Ext href={pkg.href}>{pkg.name}</Ext>
                  <span className="profile-deck__cite-meta">{pkg.year}</span>
                </li>
              ))}
            </ul>
          </article>
        </SlideShell>
      );
    }

    case "oss": {
      const [start = 0, end = j.openSource.length] = slide.ossRange ?? [];
      const items = j.openSource.slice(start, end);
      return (
        <SlideShell>
          <article className="profile-deck__feature">
            {slide.bridge ? <p className="profile-deck__bridge">{slide.bridge}</p> : null}
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="profile-deck__title profile-deck__title--feature"
            >
              {slide.title}
            </h2>
            <ul role="list" className="profile-deck__cite-list">
              {items.map((item) => (
                <li key={item.name}>
                  <p className="profile-deck__cite-label">
                    {item.name}
                    <span className="profile-deck__cite-meta"> — {item.detail}</span>
                  </p>
                  <ul role="list" className="profile-deck__feature-links">
                    {item.links.slice(0, 2).map((link) => (
                      <li key={link.href}>
                        <Ext href={link.href}>{link.label}</Ext>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </article>
        </SlideShell>
      );
    }

    case "connect":
      return (
        <SlideShell cover>
          <h2
            ref={headingRef}
            tabIndex={-1}
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
              className="profile-deck__title profile-deck__title--feature"
            >
              {slide.title}
            </h2>
            <ul role="list" className="profile-deck__cite-list">
              {j.archive.seasons.map((season) => (
                <li key={season}>
                  <p className="profile-deck__cite-meta">{season}</p>
                </li>
              ))}
            </ul>
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
              className="profile-deck__title profile-deck__title--feature"
            >
              {slide.title}
            </h2>
            <ul role="list" className="profile-deck__cite-list">
              {surfaces.map((surface) => (
                <li key={surface.href}>
                  <p className="profile-deck__cite-label">
                    <Ext href={surface.href}>{surface.name}</Ext>
                  </p>
                  <p className="profile-deck__cite-meta">
                    {surface.season} · {surface.what}
                  </p>
                </li>
              ))}
            </ul>
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
              className="profile-deck__title profile-deck__title--feature"
            >
              {slide.title}
            </h2>
            <ul role="list" className="profile-deck__cite-list">
              {sample.links.map((link) => (
                <li key={link.href}>
                  <p className="profile-deck__cite-label">
                    <Ext href={link.href}>{link.label}</Ext>
                  </p>
                </li>
              ))}
            </ul>
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
  const [index, setIndex] = useState(0);
  const labelId = useId();
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const slides = profileDeckSlides;
  const slide = slides[index] ?? slides[0];
  const total = slides.length;
  const chapterMeta = profileDeckNav.find((chapter) => chapter.id === slide.chapter);

  const goTo = useCallback(
    (next: number) => {
      setIndex(Math.max(0, Math.min(total - 1, next)));
    },
    [total]
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
    <div className="profile-deck">
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
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <p className="profile-deck__pager-label">{slide.title}</p>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              disabled={index === total - 1}
              className="profile-deck__pager-btn"
              aria-label="Next"
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
          <Link href="/profile?view=scroll" className="profile-deck__full-page">
            Full page
          </Link>
        </aside>
      </div>
    </div>
  );
}
