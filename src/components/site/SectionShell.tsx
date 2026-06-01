import type { ReactNode } from "react";

type SectionShellProps = {
  id: string;
  headingId: string;
  background?: "default" | "elevated";
  className?: string;
  children: ReactNode;
};

export function SectionShell({
  id,
  headingId,
  background = "default",
  className = "",
  children,
}: SectionShellProps) {
  const bgClass = background === "elevated" ? "bg-surface2" : "";

  return (
    <section
      id={id}
      data-section={id}
      data-section-bg={background}
      aria-labelledby={headingId}
      className={`${bgClass} ${className}`.trim()}
    >
      <div className="container mx-auto min-w-0 max-w-7xl px-6">{children}</div>
    </section>
  );
}
