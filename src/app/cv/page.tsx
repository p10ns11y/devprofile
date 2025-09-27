'use client';

import React, { Suspense } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic'

import { AISmartHighlight } from '@/components/ai-smart-highlight';
import { SocialLinks } from '@/components/social-links';
import { ThemeToggle } from '@/components/theme-toggle';
import { Home } from 'lucide-react';

import cvData from '@/data/cvdata.json'

const Layout = dynamic(
  () => import('./content-layout'),
  { ssr: false }
)


interface CVData {
  name: string;
  profile: string;
  contact: {
    email: string;
    phone: string;
    citizenship: string;
  };
  work_experience: Array<{
    title: string;
    company: string;
    location: string;
    start_date: string;
    end_date: string;
    responsibilities: string[];
    tools: string[];
  }>;
  skills: {
    product: string[];
    practices: string[];
  };
  technologies: Record<string, string[]>;
  projects: Array<{
    name: string;
    key: string;
    url: string;
    description: string;
  }>;
  publications: Array<{
    title: string;
    url: string;
    doi_url?: string;
    journal?: {
      name: string;
    };
    conference?: string;
    first_published?: string;
    date?: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
  }>;
  languages: Record<string, string>;
}

function MainContent() {
  return (
    <Layout ratios={[34, 21]} gap={1}>
      {/* Content column take almost everything and leave one column column end: -2*/}
      <div id="mainContent" className="bg-surface1 rounded-xl rad-shadow p-8">
        <h2 className="text-2xl font-bold text-text1 mb-6">Professional Profile</h2>
        <div className="text-text2 leading-relaxed mb-8">
          <AISmartHighlight priority="balanced">
            {cvData.profile}
          </AISmartHighlight>
        </div>

        <h2 className="text-2xl font-bold text-text1 mb-6">Work Experience</h2>
        <div className="space-y-8">
          {cvData.work_experience.map((job, index) => (
            <div key={index} className="border-l-4 border-brand pl-6">
              <h3 className="text-xl font-semibold text-text1 mb-2">
                {job.title} • {job.company}
              </h3>
              <p className="text-brand font-medium mb-2">
                {job.location} • {job.start_date} - {job.end_date}
              </p>
              <ul className="text-text2 space-y-1 mb-4">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-brand rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="leading-relaxed">
                      <AISmartHighlight priority="balanced">
                        {resp}
                      </AISmartHighlight>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="text-sm text-text2">
                <span className="font-medium text-text1">Tools & Technologies:</span>{' '}
                <span className="bg-surface3 px-2 py-1 rounded text-text1">
                  {job.tools.join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="bg-surface1 rounded-xl rad-shadow p-8">
        <h2 className="text-2xl font-bold text-text1 mb-6">Skills</h2>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text1 mb-2">Product</h3>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.product.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-brand/10 text-brand rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text1 mb-2">Development</h3>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.practices.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-accent-secondary/10 text-accent-secondary rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="bg-surface1 rounded-xl rad-shadow p-8">
        <h2 className="text-2xl font-bold text-text1 mb-6">Featured Projects</h2>
        <div className="space-y-4">
          {cvData.projects.map((project, index) => (
            <div key={index}>
              <a
                href={project.url}
                className="text-lg font-semibold text-brand hover:text-text1 transition-colors"
                target="_blank"
                rel="nofollow noreferrer noopener"
              >
                {project.name}
              </a>
              <p className="text-text2 text-sm mt-1">{project.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="bg-surface1 rounded-xl rad-shadow p-8">
        <h2 className="text-2xl font-bold text-text1 mb-6">Languages</h2>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(cvData.languages).map(([language, level], index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="font-medium text-text1">{language}</span>
              <span className="text-text2">{level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technologies */}
      <div className="bg-surface1 rounded-xl rad-shadow p-8">
        <h2 className="text-2xl font-bold text-text1 mb-6">Technologies</h2>
        <div className="space-y-2">
          {Object.entries(cvData.technologies).map(([category, items], index) => (
            <div key={index} className="text-sm text-text2">
              <span className="font-semibold text-text1 capitalize">{category}:</span> {items.join(', ')}
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="bg-surface1 rounded-xl rad-shadow p-8">
        <h2 className="text-2xl font-bold text-text1 mb-6">Education</h2>
        <div className="space-y-4">
          {cvData.education.map((edu, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold text-text1">{edu.degree}</h3>
              <p className="text-text2">{edu.institution}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Publications */}
      <div className="bg-surface1 rounded-xl rad-shadow p-8">
        <h2 className="text-2xl font-bold text-text1 mb-6">Publications</h2>
        <div className="space-y-4">
          {cvData.publications.map((pub, index) => (
            <div key={index} className="mb-4">
              <a
                href={pub.doi_url || pub.url}
                className="text-lg font-semibold text-brand hover:text-text1 transition-colors"
                target="_blank"
                rel="nofollow noreferrer noopener"
              >
                {pub.title}
              </a>
              <p className="text-text2 text-sm mt-1">
                {pub.journal ? `${pub.journal.name}` : pub.conference}, {pub.first_published || pub.date}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

const CVWebView = () => {
  return (
    <>
      <Head>
        <title>{cvData.name} | {cvData.latest_proffessional_role} CV</title>
        <meta name="description" content={`Professional CV of ${cvData.name}, Senior Software Engineer with expertise in ${Object.keys(cvData.technologies).join(', ')}`} />
        <meta name="keywords" content="CV, Resume, Senior Software Engineer, Full Stack Developer" />
        <meta property="og:title" content={`${cvData.name} | Senior Software Engineer`} />
        <meta property="og:description" content={cvData.profile} />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-surface1 via-surface2 to-surface1">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="text-center mb-12 relative">
            <div className="absolute top-0 right-0 flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-4">
              <ThemeToggle />
              <Link href="/" className="inline-flex items-center px-3 py-2 bg-surface3 text-text1 font-medium rounded-lg hover:bg-surface4 transition-colors" title="Back to Home">
                <Home className="w-4 h-4" />
              </Link>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-text1 mb-4">
              {cvData.name}
            </h1>
            <p className="text-xl md:text-2xl text-brand font-medium mb-6">
              {cvData.latest_proffessional_role}
            </p>

            {/* Contact Info */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-text2 mb-8">
              <a href={`mailto:${cvData.contact.email}`} className="hover:text-brand transition-colors">
                {cvData.contact.email}
              </a>
              <span className="hidden md:inline text-text2">•</span>
              <a href={`tel:${cvData.contact.phone}`} className="hover:text-brand transition-colors">
                {cvData.contact.phone}
              </a>
              <span className="hidden md:inline text-text2">•</span>
              <span className="text-text1">{cvData.contact.citizenship}</span>
            </div>

            <div className='pb-10'>
              <SocialLinks />
            </div>

            {/* Download Buttons */}
            <div className="flex justify-center gap-4 mb-8">
              <a
                href="/cv.pdf"
                className="inline-flex items-center px-6 py-3 bg-brand text-text1 font-medium rounded-lg hover:bg-brand/90 transition-colors"
              >
                📖 View PDF
              </a>
              <a
                href="/api/cv/download"
                download="peramanathan-sathyamoorthy-cv.pdf"
                className="inline-flex items-center px-6 py-3 bg-accent-secondary text-accent-secondary-text font-medium rounded-lg hover:bg-accent-secondary/90 transition-colors"
              >
                ⬇️ Download PDF
              </a>
            </div>
          </div>

          {/* Main Content Grid */}
          <Suspense fallback="loading...">
            <MainContent />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default CVWebView;

