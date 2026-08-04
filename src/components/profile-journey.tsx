"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { profileJourney } from "@/data/profile-journey";
import {
  defaultViewport,
  fadeUp,
  itemTransition,
  motionTransition,
  staggerContainer,
} from "@/lib/motion";
import { SectionHeading } from "./site/SectionHeading";
import { SectionShell } from "./site/SectionShell";
import { SiteButton } from "./site/SiteButton";
import { Badge } from "./ui/badge";

const externalRel = "nofollow noreferrer noopener";

function ExternalLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel={externalRel}
      className={`underline-offset-4 transition-colors hover:text-link hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand-emphasis) ${className}`.trim()}
    >
      {children}
    </a>
  );
}

function JourneyDetails({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="group rounded-xl border border-(--color-border-subtle) bg-surface1 open:bg-surface1">
      <summary className="cursor-pointer list-none px-5 py-4 font-medium text-text1 marker:content-none [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand-emphasis)">
        <span className="flex items-center justify-between gap-3">
          {summary}
          <span
            className="text-text2 transition-transform group-open:rotate-180"
            aria-hidden="true"
          >
            ▾
          </span>
        </span>
      </summary>
      <div className="border-t border-(--color-border-subtle) px-5 py-4">{children}</div>
    </details>
  );
}

export function ProfileJourney() {
  const shouldReduceMotion = useReducedMotion();
  const j = profileJourney;

  return (
    <div className="pt-[var(--header-offset)] pb-20 min-w-0">
      <SectionShell id="arrive" headingId="profile-arrive-heading" className="py-14 sm:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeUp}
          transition={motionTransition(!!shouldReduceMotion, 0.55)}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="eyebrow">GitHub profile overview · full curated journey</p>
          <p className="mt-3 font-mono text-sm text-text2">@{j.handle}</p>
          <h1
            id="profile-arrive-heading"
            className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.25rem)] leading-[1.1] tracking-[-0.03em] text-text1"
          >
            {j.name}
          </h1>
          <p className="mt-3 text-base text-text1 sm:text-lg">{j.tagline}</p>
          <p className="mt-2 text-sm text-text2">{j.location}</p>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-text2 sm:text-base">
            {j.githubBio}
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-text1 sm:text-base">
            {j.intro} <ExternalLink href={j.org.href}>@{j.org.name}</ExternalLink>.
          </p>

          <ul
            role="list"
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
            aria-label="Profile links"
          >
            {j.badges.map((badge) => (
              <li key={badge.href}>
                <a
                  href={badge.href}
                  target="_blank"
                  rel={externalRel}
                  className="inline-flex min-h-9 items-center rounded-md border border-(--color-border-subtle) bg-surface2 px-3 py-1.5 text-xs font-medium text-text1 transition-colors hover:border-[color-mix(in_oklch,var(--color-brand-emphasis)_30%,var(--color-border-subtle))] hover:bg-surface3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand-emphasis)"
                >
                  {badge.label}
                </a>
              </li>
            ))}
          </ul>

          <nav aria-label="Journey chapters" className="mt-8">
            <ul
              role="list"
              className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-text2"
            >
              {j.toc.map((item, index) => (
                <li key={item.href} className="inline-flex items-center gap-3">
                  {index > 0 ? <span aria-hidden="true">·</span> : null}
                  <a
                    href={item.href}
                    className="text-text1 underline-offset-4 hover:text-link hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand-emphasis)"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <SiteButton variant="primary" href="/?cv=view">
              View CV
            </SiteButton>
            <SiteButton variant="secondary" href="/qa">
              Ask about my work
            </SiteButton>
            <SiteButton variant="outline" href={j.githubUrl}>
              GitHub profile
            </SiteButton>
          </div>
        </motion.div>
      </SectionShell>

      <SectionShell
        id="an-inch-at-a-time"
        headingId="story-heading"
        background="elevated"
        className="py-14 sm:py-16"
      >
        <SectionHeading
          id="story-heading"
          eyebrow="Story"
          title={j.story.title}
          description={j.story.lead}
          showUnderline
        />
        <div className="mx-auto max-w-3xl space-y-6">
          <p className="text-center text-sm leading-relaxed text-text2 sm:text-base">
            {j.story.body}
          </p>
          <p className="text-center text-xs font-medium tracking-wide text-text2 uppercase">
            {j.story.timelineLabel}
          </p>
          <ol role="list" className="grid gap-4">
            {j.story.timeline.map((row) => (
              <li
                key={row.phase}
                className="rounded-xl border border-(--color-border-subtle) bg-surface1 p-5"
              >
                <p className="text-sm font-semibold text-text1">{row.phase}</p>
                <p className="mt-2 text-sm leading-relaxed text-text2">{row.html}</p>
                {row.links.length > 0 ? (
                  <ul role="list" className="mt-3 flex flex-wrap gap-2">
                    {row.links.map((link) => (
                      <li key={link.href}>
                        <ExternalLink href={link.href} className="text-sm font-medium">
                          {link.label}
                        </ExternalLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
          <blockquote className="border-l-2 border-brand pl-4 text-sm leading-relaxed text-text1 italic sm:text-base">
            {j.story.quote}
          </blockquote>
        </div>
      </SectionShell>

      <SectionShell id="featured" headingId="featured-heading" className="py-14 sm:py-16">
        <SectionHeading
          id="featured-heading"
          eyebrow="Featured"
          title="Featured work"
          description={j.featuredLead}
          showUnderline
        />
        <motion.ol
          role="list"
          className="mx-auto flex max-w-3xl flex-col gap-0 border-l border-[color-mix(in_oklch,var(--color-brand-emphasis)_35%,var(--color-border-subtle))]"
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={staggerContainer}
        >
          {j.featured.map((project, index) => (
            <motion.li
              key={project.slug}
              variants={fadeUp}
              transition={itemTransition(!!shouldReduceMotion)}
              className="relative border-b border-(--color-border-subtle) last:border-b-0"
            >
              <article data-card="project" className="grid gap-3 py-8 pl-8 sm:pl-10">
                <span
                  className="absolute top-10 left-0 size-2.5 -translate-x-1/2 rounded-full bg-brand"
                  aria-hidden="true"
                />
                <p className="text-xs font-medium tracking-wide text-text2 uppercase">
                  {String(index + 1).padStart(2, "0")} · Featured
                </p>
                <h3 className="font-[family-name:var(--font-display)] text-xl tracking-[-0.02em] text-text1 sm:text-2xl">
                  <ExternalLink href={project.href}>{project.name}</ExternalLink>
                </h3>
                <ul role="list" className="flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <li key={tech}>
                      <Badge variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    </li>
                  ))}
                </ul>
                {project.links?.length ? (
                  <ul role="list" className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                    {project.links.map((link) => (
                      <li key={link.href}>
                        <ExternalLink href={link.href}>{link.label}</ExternalLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p className="max-w-prose text-sm leading-relaxed text-text2 sm:text-base">
                  {project.summary}
                </p>
                <ul
                  role="list"
                  className="mt-3 max-w-prose list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-text2"
                >
                  {project.highlights.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <p className="mt-3 max-w-prose text-sm leading-relaxed text-text1">
                  <span className="font-medium">Learn</span> — {project.learn}
                </p>
              </article>
            </motion.li>
          ))}
        </motion.ol>
      </SectionShell>

      <SectionShell
        id="cooking"
        headingId="cooking-heading"
        background="elevated"
        className="py-14 sm:py-16"
      >
        <SectionHeading
          id="cooking-heading"
          eyebrow="Cooking"
          title="Still under heat"
          description={j.cookingLead}
          showUnderline
        />
        <ul role="list" className="mx-auto grid max-w-4xl gap-4">
          {j.cooking.map((item) => (
            <li key={item.name}>
              <article
                data-card="project"
                className="rounded-xl border border-(--color-border-subtle) bg-surface1 p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold text-text1">
                    {item.href ? (
                      <ExternalLink href={item.href}>{item.name}</ExternalLink>
                    ) : (
                      item.name
                    )}
                  </h3>
                  <p className="text-xs font-medium tracking-wide text-text2 uppercase">
                    {item.stack}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-text1">{item.summary}</p>
                <ul
                  role="list"
                  className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-text2"
                >
                  {item.highlights.slice(0, 3).map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <p className="mt-3 text-sm leading-relaxed text-text2">
                  <span className="font-medium text-text1">Watch for</span> — {item.watchFor}
                </p>
              </article>
            </li>
          ))}
        </ul>
        <aside className="mx-auto mt-8 max-w-4xl rounded-xl border border-(--color-border-subtle) bg-surface2 p-5 sm:p-6">
          <p className="text-xs font-semibold tracking-wide text-[var(--color-brand-emphasis)] uppercase">
            Focus — not a project
          </p>
          <h3 className="mt-2 font-(family-name:--font-display) text-xl text-text1">
            {j.energyFocus.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-text1">{j.energyFocus.lead}</p>
          <ul
            role="list"
            className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-text2"
          >
            {j.energyFocus.highlights.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-text2">
            <ExternalLink href={j.energyFocus.connected.href}>
              {j.energyFocus.connected.label}
            </ExternalLink>
            <span> — {j.energyFocus.learn}</span>
          </p>
        </aside>
      </SectionShell>

      <SectionShell id="proof-of-concepts" headingId="pocs-heading" className="py-14 sm:py-16">
        <SectionHeading
          id="pocs-heading"
          eyebrow="Proof of concepts"
          title="Shipped to learn"
          description={j.pocsLead}
          showUnderline
        />
        <ul role="list" className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          {j.pocs.map((poc) => (
            <li key={poc.href}>
              <article
                data-card="project"
                className="flex h-full flex-col rounded-xl border border-(--color-border-subtle) bg-surface2 p-5 sm:p-6"
              >
                <h3 className="text-lg font-semibold text-text1">
                  <ExternalLink href={poc.href}>{poc.name}</ExternalLink>
                </h3>
                <p className="mt-1 text-xs font-medium tracking-wide text-text2 uppercase">
                  {poc.stack}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-text1">{poc.summary}</p>
                <ul
                  role="list"
                  className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-text2"
                >
                  {poc.highlights.slice(0, 3).map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-text2">
                  <span className="font-medium text-text1">Proves</span> — {poc.proves}
                </p>
                {poc.liveHref ? (
                  <p className="mt-4 text-sm">
                    <ExternalLink href={poc.liveHref}>Live demo</ExternalLink>
                  </p>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      </SectionShell>

      <SectionShell
        id="long-arc"
        headingId="long-arc-heading"
        background="elevated"
        className="py-14 sm:py-16"
      >
        <SectionHeading
          id="long-arc-heading"
          eyebrow="Long arc"
          title="Orchestrate under constraint"
          description={j.longArc.lead}
          showUnderline
        />
        <div className="mx-auto max-w-3xl space-y-4">
          <p className="text-sm leading-relaxed text-text1 sm:text-base">{j.longArc.core}</p>
          <JourneyDetails summary="Thesis & papers · 2015–2017">
            <p className="mb-4 text-sm text-text2">{j.longArc.thesisNote}</p>
            <ul role="list" className="space-y-4">
              {j.longArc.thesisPapers.map((row) => (
                <li key={row.label}>
                  <p className="font-medium text-text1">{row.label}</p>
                  {row.note ? <p className="mt-1 text-sm text-text2">{row.note}</p> : null}
                  <ul role="list" className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                    {row.links.map((link) => (
                      <li key={link.href}>
                        <ExternalLink href={link.href}>{link.label}</ExternalLink>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </JourneyDetails>
          <JourneyDetails summary="Course craft · 2011">
            <p className="mb-4 text-sm text-text2">{j.longArc.courseCraftNote}</p>
            <ul role="list" className="space-y-4">
              {j.longArc.courseCraft.map((row) => (
                <li key={row.label}>
                  <p className="font-medium text-text1">{row.label}</p>
                  <ul role="list" className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                    {row.links.map((link) => (
                      <li key={link.href}>
                        <ExternalLink href={link.href}>{link.label}</ExternalLink>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </JourneyDetails>
        </div>
      </SectionShell>

      <SectionShell id="writing-packages" headingId="writing-heading" className="py-14 sm:py-16">
        <SectionHeading
          id="writing-heading"
          eyebrow="Writing & packages"
          title="Writing and npm"
          description="Long-form on X, a Rust companion book, and packages published under ~p10ns11y."
          showUnderline
        />
        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text1">Writing</h3>
            <article className="rounded-xl border border-(--color-border-subtle) bg-surface2 p-5">
              <h4 className="font-medium text-text1">
                <ExternalLink href={j.writing.articles.href}>
                  {j.writing.articles.label}
                </ExternalLink>
              </h4>
              <p className="mt-2 text-sm text-text2">{j.writing.articles.detail}</p>
            </article>
            {j.writing.books.map((book) => (
              <article
                key={book.href}
                className="rounded-xl border border-(--color-border-subtle) bg-surface2 p-5"
              >
                <h4 className="font-medium text-text1">
                  <ExternalLink href={book.href}>{book.label}</ExternalLink>
                </h4>
                <p className="mt-2 text-sm text-text2">{book.detail}</p>
                <p className="mt-2 text-sm text-text2">
                  From <ExternalLink href={book.from.href}>{book.from.label}</ExternalLink>.
                </p>
              </article>
            ))}
          </div>
          <div>
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold text-text1">npm</h3>
              <ExternalLink href={j.writing.npmProfile} className="text-sm">
                ~p10ns11y
              </ExternalLink>
            </div>
            <div className="overflow-x-auto rounded-xl border border-(--color-border-subtle)">
              <table className="w-full min-w-[18rem] text-left text-sm">
                <caption className="sr-only">npm packages by first-publish year</caption>
                <thead className="bg-surface2 text-text2">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Package
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Year
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {j.writing.npm.map((pkg) => (
                    <tr key={pkg.href} className="border-t border-(--color-border-subtle)">
                      <td className="px-4 py-3">
                        <ExternalLink href={pkg.href}>{pkg.name}</ExternalLink>
                      </td>
                      <td className="px-4 py-3 text-text2">{pkg.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="more"
        headingId="more-heading"
        background="elevated"
        className="py-14 sm:py-16"
      >
        <SectionHeading
          id="more-heading"
          eyebrow="More"
          title="Open source, connect, archive"
          description="The rest of the GitHub overview — kept behind progressive disclosure so the journey stays readable."
          showUnderline
        />
        <div className="mx-auto max-w-3xl space-y-4">
          <JourneyDetails summary="Open source">
            <ul role="list" className="space-y-4">
              {j.openSource.map((item) => (
                <li key={item.name}>
                  <p className="font-medium text-text1">
                    {item.name} <span className="font-normal text-text2">— {item.detail}</span>
                  </p>
                  <ul role="list" className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                    {item.links.map((link) => (
                      <li key={link.href}>
                        <ExternalLink href={link.href}>{link.label}</ExternalLink>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </JourneyDetails>

          <JourneyDetails summary="Connect">
            <ul role="list" className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {j.connect.map((link) => (
                <li key={link.href}>
                  <ExternalLink href={link.href}>{link.label}</ExternalLink>
                </li>
              ))}
            </ul>
          </JourneyDetails>

          <JourneyDetails summary="Archive">
            <p className="mb-3 text-sm text-text2">{j.archive.lead}</p>
            <ol role="list" className="mb-6 list-decimal space-y-2 pl-5 text-sm text-text2">
              {j.archive.seasons.map((season) => (
                <li key={season}>{season}</li>
              ))}
            </ol>
            <JourneyDetails summary="Surfaces · samples · stubs">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[28rem] text-left text-sm">
                  <caption className="sr-only">Archive surfaces by season</caption>
                  <thead className="text-text2">
                    <tr>
                      <th scope="col" className="py-2 pr-3 font-medium">
                        Surface
                      </th>
                      <th scope="col" className="py-2 pr-3 font-medium">
                        Season
                      </th>
                      <th scope="col" className="py-2 font-medium">
                        What it was
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {j.archive.surfaces.map((surface) => (
                      <tr key={surface.href} className="border-t border-(--color-border-subtle)">
                        <td className="py-2 pr-3">
                          <ExternalLink href={surface.href}>{surface.name}</ExternalLink>
                        </td>
                        <td className="py-2 pr-3 text-text2">{surface.season}</td>
                        <td className="py-2 text-text2">{surface.what}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul role="list" className="mt-6 space-y-4">
                {j.archive.samples.map((sample) => (
                  <li key={sample.surface}>
                    <p className="font-medium text-text1">{sample.surface}</p>
                    <ul role="list" className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                      {sample.links.map((link) => (
                        <li key={link.href}>
                          <ExternalLink href={link.href}>{link.label}</ExternalLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </JourneyDetails>
          </JourneyDetails>
        </div>
      </SectionShell>

      <SectionShell id="next" headingId="next-heading" className="py-14 sm:py-16">
        <SectionHeading
          id="next-heading"
          eyebrow="Continue"
          title="On this site and beyond"
          description="Live activity and the long repo tail stay on GitHub / Live GitHub — this page stays the curated overview."
          showUnderline
        />
        <nav
          aria-label="Continue reading"
          className="mx-auto flex max-w-2xl flex-wrap justify-center gap-3"
        >
          {j.nextLinks.map((link) =>
            link.href.startsWith("http") ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel={externalRel}
                className="inline-flex min-h-11 items-center rounded-lg border border-(--color-border-subtle) bg-surface2 px-4 py-2 text-sm font-medium text-text1 transition-colors hover:border-[color-mix(in_oklch,var(--color-brand-emphasis)_25%,var(--color-border-subtle))] hover:bg-surface3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand-emphasis)"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-11 items-center rounded-lg border border-(--color-border-subtle) bg-surface2 px-4 py-2 text-sm font-medium text-text1 transition-colors hover:border-[color-mix(in_oklch,var(--color-brand-emphasis)_25%,var(--color-border-subtle))] hover:bg-surface3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand-emphasis)"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <footer className="mx-auto mt-16 max-w-2xl text-center">
          <blockquote className="font-[family-name:var(--font-display)] text-lg leading-snug tracking-[-0.02em] text-text1 italic sm:text-xl">
            “{j.footer.quote}”
          </blockquote>
          <p className="mt-3 text-sm text-text2">
            <ExternalLink href={j.footer.quoteHref}>{j.footer.quoteAttribution}</ExternalLink>
          </p>
          <p className="mt-6 text-xs tracking-wide text-text2 uppercase">{j.footer.tagline}</p>
        </footer>
      </SectionShell>
    </div>
  );
}
