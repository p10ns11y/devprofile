export interface Post {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  slug: string;
  date: string;
}

export interface Brief {
  id: string;
  title: string;
  summary: string;
  sourceLink: string;
  tags: string[];
  date: string;
}

export interface Reading {
  id: string;
  title: string;
  author: string;
  progress: string;
  content: string;
  tags: string[];
}

export const samplePosts: Post[] = [
  {
    id: '1',
    title: 'Building Scalable Web Applications with Next.js',
    excerpt: 'Explore the best practices for creating performant and maintainable web apps using Next.js, including server-side rendering and static generation.',
    tags: ['web development', 'next.js', 'react'],
    slug: 'building-scalable-web-apps-nextjs',
    date: '2023-10-01',
  },
  {
    id: '2',
    title: 'Introduction to TypeScript for Beginners',
    excerpt: 'A comprehensive guide to getting started with TypeScript, covering types, interfaces, and advanced features for better code quality.',
    tags: ['typescript', 'javascript', 'programming'],
    slug: 'introduction-typescript-beginners',
    date: '2023-09-15',
  },
  {
    id: '3',
    title: 'Optimizing Database Queries in PostgreSQL',
    excerpt: 'Learn how to write efficient SQL queries and use indexing strategies to improve database performance in PostgreSQL.',
    tags: ['database', 'postgresql', 'sql'],
    slug: 'optimizing-database-queries-postgresql',
    date: '2023-08-20',
  },
  {
    id: '4',
    title: 'Machine Learning Fundamentals with Python',
    excerpt: 'Dive into the basics of machine learning using Python, covering algorithms, data preprocessing, and model evaluation.',
    tags: ['machine learning', 'python', 'ai'],
    slug: 'machine-learning-fundamentals-python',
    date: '2023-07-10',
  },
  {
    id: '5',
    title: 'Designing Accessible User Interfaces',
    excerpt: 'Best practices for creating inclusive UI designs that work for everyone, including users with disabilities.',
    tags: ['ui design', 'accessibility', 'ux'],
    slug: 'designing-accessible-user-interfaces',
    date: '2023-06-05',
  },
  {
    id: '6',
    title: 'DevOps Best Practices for Modern Teams',
    excerpt: 'Essential DevOps principles and tools for improving collaboration, automation, and deployment processes in software development.',
    tags: ['devops', 'ci/cd', 'automation'],
    slug: 'devops-best-practices-modern-teams',
    date: '2023-05-12',
  },
];

export const sampleBriefs: Brief[] = [
  {
    id: '1966811876374847488',
    title: 'Multi-Phase Buying List for Dev Setup (Framework 13 + Mac Mini M4 Hybrid)', // Update with actual title
    date: '2025-09-13', // Update with actual publish date
    tags: ['tech', 'laptops', 'buying list', 'mac mini', 'framework 13'],
    summary: 'Phased approach to prioritize essential components for immediate coding, followed by storage solutions, GPU acceleration for AI tasks, and finally, advanced upgrades for long-term performance. Prices are estimated for July 2025 and should be verified with current retailers. The total projected cost ranges from approximately $3,900 to $5,000.', // Update with actual summary
    sourceLink: 'https://x.com/Peramanathan/status/1966829415242903836', // Update to published URL if available
  },
  {
    id: '1948380952385687553',
    title: 'Why Hiding Your Data is a Losing Game: Embrace Selective Transparency in 2025!', // Update with actual title
    date: '2025-07-24', // Update with actual publish date
    tags: ['tech', 'privacy', 'data', 'security'],
    summary: "In a world where your smart fridge might snitch on you before you've even set up its password, is 'privacy' just a comforting myth? Let's unpack a bold idea: Being selectively transparent, visible, and fair with data might actually be the smarter move than chasing elusive individual security. Here's why, grounded in the gritty realities of our hyper-connected era. 🛡️🔓", // Update with actual summary
    sourceLink: 'https://x.com/Peramanathan/status/1948381862893662576', // Update to published URL if available
  },
  {
    id: '1948380952385687554',
    title: 'Essential macOS Developer Guide: Leveraging M4 with 16GB RAM and 256GB SSD on Limited Resources', // Update with actual title
    date: '2025-06-23', // Update with actual publish date
    tags: ['tech', 'macOS', 'developer guide', 'm4', 'mac mini'],
    summary: 'Comprehensive setup for AI/ML, Data Science/Engineering, DevOps, Web, Mobile (Apple/Android/React Native), and Rust/WebAssembly development on macOS Sequoia.', // Update with actual summary
    sourceLink: 'https://x.com/Peramanathan/status/1948120888173289474'
  },
  // {
  //   id: '1',
  //   title: 'The Future of AI in Healthcare',
  //   summary: 'An overview of how artificial intelligence is transforming healthcare, from diagnostics to personalized treatment plans.',
  //   sourceLink: 'https://example.com/ai-healthcare',
  //   tags: ['ai', 'healthcare', 'technology'],
  //   date: '2023-10-02',
  // },
  // {
  //   id: '2',
  //   title: 'Sustainable Web Development Practices',
  //   summary: 'Strategies for building environmentally friendly websites, including efficient coding and green hosting options.',
  //   sourceLink: 'https://example.com/sustainable-web-dev',
  //   tags: ['web development', 'sustainability', 'environment'],
  //   date: '2023-09-18',
  // },
  // {
  //   id: '3',
  //   title: 'Cryptocurrency Trends in 2024',
  //   summary: 'Analysis of emerging trends in the crypto space, including DeFi, NFTs, and regulatory developments.',
  //   sourceLink: 'https://example.com/crypto-trends-2024',
  //   tags: ['cryptocurrency', 'blockchain', 'finance'],
  //   date: '2023-08-25',
  // },
  // {
  //   id: '4',
  //   title: 'Advancements in Quantum Computing',
  //   summary: 'Exploring the latest breakthroughs in quantum computing and their potential impact on various industries.',
  //   sourceLink: 'https://example.com/quantum-computing-advancements',
  //   tags: ['quantum computing', 'technology', 'science'],
  //   date: '2023-07-14',
  // },
  // {
  //   id: '5',
  //   title: 'Mental Health in the Workplace',
  //   summary: 'Discussion on promoting mental wellness in professional environments and strategies for employee support.',
  //   sourceLink: 'https://example.com/mental-health-workplace',
  //   tags: ['mental health', 'workplace', 'wellness'],
  //   date: '2023-06-08',
  // },
  // {
  //   id: '6',
  //   title: 'The Rise of Edge Computing',
  //   summary: 'How edge computing is changing data processing and enabling faster, more efficient applications.',
  //   sourceLink: 'https://example.com/rise-edge-computing',
  //   tags: ['edge computing', 'iot', 'technology'],
  //   date: '2023-05-20',
  // },
];

export const sampleReadings: Reading[] = [
  {
    id: '1',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    progress: '75% complete',
    content: 'This book provides guidance on writing clean, maintainable code. It covers principles of software craftsmanship, refactoring techniques, and best practices for agile development.',
    tags: ['software development', 'clean code', 'agile'],
  },
  {
    id: '2',
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt and David Thomas',
    progress: '60% complete',
    content: 'A collection of practical tips and techniques for software development, emphasizing pragmatism, automation, and continuous learning.',
    tags: ['software development', 'programming', 'best practices'],
  },
  {
    id: '3',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Gang of Four',
    progress: '40% complete',
    content: 'This classic book presents 23 design patterns that help solve common software design problems in an object-oriented context.',
    tags: ['design patterns', 'object-oriented', 'software architecture'],
  },
  {
    id: '4',
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    progress: '90% complete',
    content: 'An exploration of the best features of JavaScript, helping developers write better, more maintainable code.',
    tags: ['javascript', 'programming', 'web development'],
  },
  {
    id: '5',
    title: 'You Don\'t Know JS',
    author: 'Kyle Simpson',
    progress: '30% complete',
    content: 'A series that dives deep into the core mechanisms of JavaScript, helping developers understand the language at a fundamental level.',
    tags: ['javascript', 'programming', 'advanced'],
  },
  {
    id: '6',
    title: 'The Phoenix Project',
    author: 'Gene Kim, Kevin Behr, and George Spafford',
    progress: '50% complete',
    content: 'A novel that illustrates DevOps principles through the story of a struggling IT department and their journey to improvement.',
    tags: ['devops', 'it management', 'business'],
  },
];
