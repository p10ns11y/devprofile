import cvdata from "../data/cvdata.json";

export function roleAnchorId(index: number) {
  return `experience-role-${index}`;
}

export function TimelineContent() {
  return (
    <div className="experience-timeline-wrap">
      <h3 className="subsection-title subsection-heading">Career at a glance</h3>
      <ol role="list" className="experience-timeline">
        {cvdata.work_experience.map((exp, index) => (
          <li key={`${exp.company}-${exp.start_date}`}>
            <a href={`#${roleAnchorId(index)}`} className="experience-timeline-card">
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
