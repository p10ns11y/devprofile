import Link from "next/link";
import { FOCUS_INDEX_HREF, type FocusEssaySlug, getFocusEssay } from "@/data/focus-essays";

export function FocusSeriesNav({ current }: { current: FocusEssaySlug | "index" }) {
  const essay = current === "index" ? null : getFocusEssay(current);

  return (
    <nav aria-label="Focus series" className="focus-series">
      <ol>
        <li>
          {current === "index" ? (
            <span aria-current="page">Focus</span>
          ) : (
            <Link href={FOCUS_INDEX_HREF}>Focus</Link>
          )}
        </li>
        {essay ? (
          <li>
            <span aria-current="page">{essay.navLabel}</span>
          </li>
        ) : null}
      </ol>
    </nav>
  );
}
