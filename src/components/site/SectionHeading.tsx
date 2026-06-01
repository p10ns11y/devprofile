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
    <header className={`text-center mb-10 md:mb-12 ${className}`}>
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      <h2 id={id} className="section-title mb-4">
        {title}
      </h2>
      {showUnderline ? (
        <div
          className="w-16 h-0.5 mx-auto mb-5 bg-[var(--color-brand-emphasis)] opacity-80"
          aria-hidden="true"
        />
      ) : null}
      {description ? (
        <p className="section-lead max-w-2xl mx-auto break-words">{description}</p>
      ) : null}
    </header>
  );
}
