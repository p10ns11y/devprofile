import Head from 'next/head';
import Link from 'next/link';

export default function ContentHubLanding() {
  return (
    <>
      <Head>
        <title>Content Hub</title>
        <meta name="description" content="Explore writeups, briefs, and readings on technology, programming, and more." />
      </Head>
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="mb-4 text-center">
          <Link href="/" className="inline-flex items-center text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 text-sm font-medium">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L2 12.414V19a1 1 0 001 1h3a1 1 0 001-1v-3a1 1 0 011-1h2a1 1 0 011 1v3a1 1 0 001 1h3a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-9-9z"/>
            </svg>
            Home
          </Link>
        </div>
        <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">Content Hub</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
          Discover a curated collection of insights, summaries, and recommendations across technology, programming, and beyond.
          Dive into user-written posts, external content briefs, and reading suggestions with read-aloud functionality.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/content-hub/writeups" className="group">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400">
                Writeups
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Explore detailed posts on web development, programming, and tech topics.
              </p>
            </div>
          </Link>
          <Link href="/content-hub/briefs" className="group">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-500">
                Briefs
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Quick summaries of external articles and trends in AI, sustainability, and more.
              </p>
            </div>
          </Link>
          <Link href="/content-hub/readings" className="group">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400">
                Readings
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Recommended books and articles with progress tracking and read-aloud features.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
