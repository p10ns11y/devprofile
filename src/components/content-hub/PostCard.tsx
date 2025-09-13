import React from 'react';
import { Post } from '../../lib/content-hub/data';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{post.title}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{post.excerpt}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag, index) => (
          <span
            key={index}
            className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
      <time className="text-sm text-gray-500 dark:text-gray-400" dateTime={post.date}>
        {new Date(post.date).toLocaleDateString()}
      </time>
    </article>
  );
}
