import Link from "next/link";

export function FocusRelated({
  eyebrow,
  href,
  title,
  detail,
}: {
  eyebrow: string;
  href: string;
  title: string;
  detail: string;
}) {
  return (
    <aside className="focus-related" aria-label={eyebrow}>
      <p className="focus-related__eyebrow">{eyebrow}</p>
      <p className="focus-related__title">
        <Link href={href}>{title}</Link>
      </p>
      <p className="focus-related__detail">{detail}</p>
    </aside>
  );
}
