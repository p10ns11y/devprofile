import cvdata from "@/data/cvdata.json";
import { recentCourses } from "@/lib/homepage-from-cvdata";
import { SectionHeading } from "./site/SectionHeading";
import { SectionShell } from "./site/SectionShell";

const headingId = "academic-heading";

type Publication = (typeof cvdata.publications)[number];

function publicationYear(item: Publication): string {
  if ("first_published" in item && typeof item.first_published === "string") {
    return item.first_published.slice(0, 4);
  }
  if ("date" in item && typeof item.date === "string") {
    return item.date.slice(0, 4);
  }
  return "";
}

function publicationVenue(item: Publication): string {
  if ("journal" in item && item.journal && typeof item.journal === "object" && "name" in item.journal) {
    return String(item.journal.name);
  }
  if ("conference" in item && typeof item.conference === "string") {
    return item.conference;
  }
  return "";
}

function publicationKind(item: Publication): string {
  if ("journal" in item) {
    return "journal";
  }
  if ("conference" in item) {
    return "conference";
  }
  return "paper";
}

const publications = [...cvdata.publications].sort(
  (a, b) => publicationYear(a).localeCompare(publicationYear(b))
);

export function Background() {
  return (
    <SectionShell id="academic" headingId={headingId} background="elevated">
      <SectionHeading
        id={headingId}
        title="Academic"
        description="The Uppsala master's ran from 2010 to 2016. I stayed with the thesis a bit longer through a personal interval — marriage, settling in — then published it as a conference paper and a journal article."
        showUnderline
      />

      <div className="background-stack">
        <section aria-labelledby="education-heading">
          <h3 id="education-heading" className="subsection-title">
            Education
          </h3>
          <ul className="work-beats">
            {cvdata.education.map((item) => (
              <li key={item.degree}>
                {item.degree}, {item.institution} ({item.years})
                {"thesis" in item && item.thesis ? (
                  <span className="claim-evidence__where"> Thesis: {item.thesis}.</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="publications-heading">
          <h3 id="publications-heading" className="subsection-title">
            Publications
          </h3>
          <ul className="work-beats">
            {publications.map((item) => {
              const year = publicationYear(item);
              const venue = publicationVenue(item);
              const kind = publicationKind(item);
              return (
                <li key={item.title}>
                  {year ? `${year}, ` : null}
                  {kind}.{" "}
                  <a href={item.doi_url}>{item.title}</a>
                  {venue ? ` ${venue}.` : null}
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="languages-heading">
          <h3 id="languages-heading" className="subsection-title">
            Languages
          </h3>
          <p className="section-lead">
            English {cvdata.languages.English.toLowerCase()}, Swedish{" "}
            {cvdata.languages.Swedish.toLowerCase()}.
          </p>
        </section>

        <section aria-labelledby="courses-heading">
          <h3 id="courses-heading" className="subsection-title">
            Courses
          </h3>
          <ul className="work-beats">
            {recentCourses().map((course) => (
              <li key={course.name}>
                <a href={course.url} target="_blank" rel="noopener noreferrer">
                  {course.name}
                </a>
                {course.provider ? ` · ${course.provider}` : null}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </SectionShell>
  );
}
