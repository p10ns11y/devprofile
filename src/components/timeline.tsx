"use client";

import cvdata from "../data/cvdata.json";

export function TimelineContent() {
  return (
    <div className="flex justify-center py-4">
      <ol
        role="list"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl w-full min-w-0 text-center text-sm"
      >
        {cvdata.work_experience.map((exp) => (
          <li key={`${exp.company}-${exp.start_date}`}>
            <article className="bg-surface3 rounded-lg p-3 text-xs h-full min-w-0 break-words">
              <p className="font-semibold text-text1 mb-1">{exp.start_date.split(" ").pop()}</p>
              <p className="text-text2 line-clamp-2">{exp.title}</p>
              <p className="text-brand font-medium line-clamp-2">{exp.company.split(",")[0]}</p>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
