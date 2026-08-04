import { roleAnchorId } from "@/lib/experience-anchors";
import cvdata from "../data/cvdata.json";

export function TimelineContent() {
  return (
    <div className="experience-timeline-wrap flex flex-col items-center">
      <h3 className="subsection-title subsection-heading w-full" data-align="center">
        Career at a glance
      </h3>
      <ol role="list" className="experience-timeline w-full">
        {cvdata.work_experience.map((exp) => (
          <li key={`${exp.company}-${exp.start_date}`}>
            <a href={`#${roleAnchorId(exp)}`} className="experience-timeline-card">
              <span className="experience-timeline-card__year">
                {exp.start_date.split(" ").pop()}
              </span>
              <span className="experience-timeline-card__role">{exp.title}</span>
              <span className="experience-timeline-card__company">{exp.company.split(",")[0]}</span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
