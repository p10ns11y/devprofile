'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Head from 'next/head';
import { ContentHubLayout } from "@/components/content-hub/ContentHubLayout";
import { PostCard } from "@/components/content-hub/PostCard";
import { BriefCard } from "@/components/content-hub/BriefCard";
import { ReadingCard } from "@/components/content-hub/ReadingCard";
import { samplePosts, sampleBriefs, sampleReadings, Post, Brief, Reading } from "@/lib/content-hub/data";

export default function ContentHubPage() {
  const router = useRouter();
  const params = useParams();
  const page = params?.page as string | undefined;
  const [searchTerm, setSearchTerm] = useState('');

  if (!page) {
    return <div>Loading...</div>;
  }

  let currentData: (Post | Brief | Reading)[];
  let pageTitle: string;
  let pageDescription: string;

  switch (page) {
    case 'writeups':
      currentData = samplePosts;
      pageTitle = 'Writeups - Content Hub';
      pageDescription = 'Explore user-written posts on various topics including web development, programming, and more.';
      break;
    case 'briefs':
      currentData = sampleBriefs;
      pageTitle = 'Briefs - Content Hub';
      pageDescription = 'Read summaries of external content on AI, technology, sustainability, and other trending topics.';
      break;
    case 'readings':
      currentData = sampleReadings;
      pageTitle = 'Readings - Content Hub';
      pageDescription = 'Discover recommended readings with progress tracking and read-aloud functionality for books and articles.';
      break;
    default:
      return (
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
          <p>The requested content hub page does not exist.</p>
        </div>
      );
  }

  const filteredData = currentData.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Head>
      <ContentHubLayout
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        currentPage={page}
      />
      <main className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => {
            if (page === 'writeups') {
              return <PostCard key={item.id} post={item as Post} />;
            } else if (page === 'briefs') {
              return <BriefCard key={item.id} brief={item as Brief} />;
            } else {
              return <ReadingCard key={item.id} reading={item as Reading} />;
            }
          })}
        </div>
        {filteredData.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
            No items found matching your search.
          </p>
        )}
      </main>
    </>
  );
}
