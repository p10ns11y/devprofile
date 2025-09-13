'use client';

import React, { useState } from 'react';
import { Reading } from '../../lib/content-hub/data';

interface ReadingCardProps {
  reading: Reading;
}

export function ReadingCard({ reading }: ReadingCardProps) {
  const [isReading, setIsReading] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  const handleReadAloud = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    if (isReading && utterance) {
      speechSynthesis.cancel();
      setIsReading(false);
      setUtterance(null);
    } else {
      const newUtterance = new SpeechSynthesisUtterance(reading.content);
      newUtterance.onend = () => {
        setIsReading(false);
        setUtterance(null);
      };
      setUtterance(newUtterance);
      speechSynthesis.speak(newUtterance);
      setIsReading(true);
    }
  };

  return (
    <article className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{reading.title}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-2">by {reading.author}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{reading.progress}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {reading.tags.map((tag, index) => (
          <span
            key={index}
            className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs px-2 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
      <button
        onClick={handleReadAloud}
        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        aria-label={isReading ? `Stop reading ${reading.title}` : `Read ${reading.title} aloud`}
      >
        {isReading ? 'Stop Reading' : 'Read Aloud'}
      </button>
    </article>
  );
}
