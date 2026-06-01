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
      <h2 id={id} className="text-3xl md:text-4xl font-semibold text-text1 mb-4">
        {title}
      </h2>
      {showUnderline ? (
        <div className="w-20 h-1 bg-brand mx-auto mb-6 opacity-60" aria-hidden="true" />
      ) : null}
      {description ? (
        <p className="text-text1/80 max-w-2xl mx-auto leading-relaxed break-words">{description}</p>
      ) : null}
    </header>
  );
}
