import Link from "next/link";
import type { FocusEssay } from "@/data/focus-essays";

export function FocusEssayCard({
  essay,
  featured = false,
}: {
  essay: FocusEssay;
  featured?: boolean;
}) {
  return (
    <article data-card="focus" data-featured={featured ? "true" : undefined}>
      <Link href={essay.href} className="focus-index-card__link">
        <div className="focus-index-card__frame">
          <img
            src={essay.image.src}
            alt=""
            width={essay.image.width}
            height={essay.image.height}
            loading={featured ? "eager" : "lazy"}
            decoding="async"
          />
        </div>
        <div className="focus-index-card__body">
          <p className="focus-index-card__eyebrow">{essay.eyebrow}</p>
          <h3 className="focus-index-card__title">{essay.title}</h3>
          <p className="focus-index-card__lede">{essay.cardLede}</p>
          <p className="focus-index-card__cta">
            Read essay <span aria-hidden="true">→</span>
          </p>
        </div>
      </Link>
    </article>
  );
}
