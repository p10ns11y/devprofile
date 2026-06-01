"use client";

import cvdata from "../data/cvdata.json";

export function TimelineContent() {
  return (
    <div className="experience-timeline-wrap">
      <h3 className="sr-only">Career timeline</h3>
      <ol role="list" className="experience-timeline">
        {cvdata.work_experience.map((exp) => (
          <li key={`${exp.company}-${exp.start_date}`}>
            <article className="experience-timeline-card">
              <p className="experience-timeline-card__year">{exp.start_date.split(" ").pop()}</p>
              <p className="experience-timeline-card__role">{exp.title}</p>
              <p className="experience-timeline-card__company">{exp.company.split(",")[0]}</p>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
