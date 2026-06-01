import type { ReactNode } from "react";

type SectionHeadingProps = {
  id: string;
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  showUnderline?: boolean;
  className?: string;
};

export function SectionHeading({
  id,
  title,
  eyebrow,
  description,
  showUnderline = false,
  className = "",
}: SectionHeadingProps) {
  return (
    <header className={`section-heading ${className}`.trim()}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 id={id} className="section-title">
        {title}
      </h2>
      {showUnderline ? <div className="section-heading__rule" aria-hidden="true" /> : null}
      {description ? <p className="section-lead break-words">{description}</p> : null}
    </header>
  );
}
