import { ExternalLink } from "lucide-react";
import { recentCourses } from "@/lib/homepage-from-cvdata";

function formatDate(date?: string) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const courses = [...recentCourses()].sort((a, b) => {
  const dateA = a.completionDate ? new Date(a.completionDate).getTime() : 0;
  const dateB = b.completionDate ? new Date(b.completionDate).getTime() : 0;
  return dateB - dateA;
});

type EarnedCourseCardsProps = {
  headingId: string;
  heading?: string;
  headingLevel?: "h2" | "h3";
};

export function EarnedCourseCards({
  headingId,
  heading = "Courses",
  headingLevel = "h2",
}: EarnedCourseCardsProps) {
  if (courses.length === 0) {
    return null;
  }

  const HeadingTag = headingLevel;

  return (
    <section aria-labelledby={headingId} className="credentials-block">
      <HeadingTag id={headingId} className="subsection-title subsection-heading" data-align="center">
        {heading}
      </HeadingTag>
      <ul
        role="list"
        className="credentials-grid !flex flex-wrap justify-center [&>li]:basis-full sm:[&>li]:max-w-[calc((100%-var(--marketing-space-grid))/2)] sm:[&>li]:basis-[calc((100%-var(--marketing-space-grid))/2)] lg:[&>li]:max-w-[calc((100%-3*var(--marketing-space-grid))/4)] lg:[&>li]:basis-[calc((100%-3*var(--marketing-space-grid))/4)]"
        data-grid="courses"
      >
        {courses.map((course) => (
          <li key={course.name} className="min-w-0 grow-0">
            <article data-card="credential" className="credential-card">
              <h4 className="credential-card__title">{course.name}</h4>
              <span className="credential-card__tag">{course.domain}</span>
              <div className="credential-card__foot">
                {course.completionDate ? (
                  <p className="credential-card__date">{formatDate(course.completionDate)}</p>
                ) : (
                  <span className="credential-card__date" data-empty aria-hidden="true" />
                )}
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="credential-card__cta"
                  data-cta="icon"
                  aria-label={
                    course.proof_of_accomplishment === "github_code_repo"
                      ? `View repository for ${course.name} (opens in new tab)`
                      : `View proof for ${course.name} (opens in new tab)`
                  }
                >
                  <ExternalLink className="credential-card__cta-icon" aria-hidden="true" />
                </a>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
