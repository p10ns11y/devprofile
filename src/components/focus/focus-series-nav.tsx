import Link from "next/link";
import {
  FOCUS_INDEX_HREF,
  type FocusEssaySlug,
  type FocusMemoryEssaySlug,
  getFocusEssay,
  getFocusMemoryEssay,
} from "@/data/focus-essays";

type FocusSeriesNavProps =
  | { current: "index" }
  | { current: FocusEssaySlug; memoryEssay?: never }
  | { current: "memory-issue"; memoryEssay: FocusMemoryEssaySlug };

export function FocusSeriesNav(props: FocusSeriesNavProps) {
  const essay = props.current === "index" ? null : getFocusEssay(props.current);
  const memoryEssay =
    props.current === "memory-issue" && "memoryEssay" in props && props.memoryEssay
      ? getFocusMemoryEssay(props.memoryEssay)
      : null;
  const pulseEssay = props.current === "memory-issue" ? getFocusMemoryEssay("pulse") : null;

  return (
    <nav aria-label="Focus series" className="focus-series">
      <ol>
        <li>
          {props.current === "index" ? (
            <span aria-current="page">Focus</span>
          ) : (
            <Link href={FOCUS_INDEX_HREF}>Focus</Link>
          )}
        </li>
        {essay ? (
          <li>
            {memoryEssay && memoryEssay.slug !== "pulse" ? (
              <Link href={pulseEssay?.href ?? "/focus/memory-issue"}>{pulseEssay?.navLabel}</Link>
            ) : (
              <span aria-current="page">{essay.navLabel}</span>
            )}
          </li>
        ) : null}
        {memoryEssay && memoryEssay.slug !== "pulse" ? (
          <li>
            <span aria-current="page">{memoryEssay.navLabel}</span>
          </li>
        ) : null}
      </ol>
    </nav>
  );
}
