import type { ReactNode } from "react";

type SectionHeadingProps = {
  id: string;
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  showUnderline?: boolean;
  className?: string;
  headingLevel?: "h1" | "h2";
};

export function SectionHeading({
  id,
  title,
  eyebrow,
  description,
  showUnderline = false,
  className = "",
  headingLevel = "h2",
}: SectionHeadingProps) {
  const HeadingTag = headingLevel;
  return (
    <header className={`section-heading ${className}`.trim()}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <HeadingTag id={id} className="section-title">
        {title}
      </HeadingTag>
      {showUnderline ? <div className="section-heading__rule" aria-hidden="true" /> : null}
      {description ? <p className="section-lead break-words">{description}</p> : null}
    </header>
  );
}
