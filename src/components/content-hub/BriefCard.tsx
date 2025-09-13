import React from 'react';
import { Brief } from '../../lib/content-hub/data';

interface BriefCardProps {
  brief: Brief;
}

export function BriefCard({ brief }: BriefCardProps) {
  return (
    <article className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{brief.title}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{brief.summary}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {brief.tags.map((tag, index) => (
          <span
            key={index}
            className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <time className="text-sm text-gray-500 dark:text-gray-400" dateTime={brief.date}>
          {new Date(brief.date).toLocaleDateString()}
        </time>
        <a
          href={brief.sourceLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm font-medium"
          aria-label={`Read full article: ${brief.title}`}
        >
          Read More →
        </a>
      </div>
    </article>
  );
}
