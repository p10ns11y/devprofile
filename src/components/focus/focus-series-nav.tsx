import Link from "next/link";

type FocusEssay = "index" | "memory-issue";

export function FocusSeriesNav({ current }: { current: FocusEssay }) {
  return (
    <nav aria-label="Focus series" className="focus-series">
      <ol>
        <li>
          {current === "index" ? (
            <span aria-current="page">Focus</span>
          ) : (
            <Link href="/focus">Focus</Link>
          )}
        </li>
        {current === "memory-issue" ? (
          <li>
            <span aria-current="page">Pulse instead of dump</span>
          </li>
        ) : null}
      </ol>
    </nav>
  );
}
