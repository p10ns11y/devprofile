import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

import { AISmartHighlight } from '@/components/ai-smart-highlight';
import { SocialLinks } from '@/components/social-links';

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
    url: string;
    description: string;
  }>;
  publications: string[];
  education: Array<{
    degree: string;
    institution: string;
  }>;
  languages: Record<string, string>;
}

const CVWebView = () => {
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load CV data client-side
    fetch('/api/cv/data')
      .then(res => res.json())
      .then(data => {
        setCvData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading CV data:', error);
        setLoading(false);
      });
  }, []);

  const handleDownloadPDF = async () => {
    try {
      // Directly navigate to the API which will trigger download
      window.location.href = '/api/cv/generate';
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading CV...</div>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Error loading CV data</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{cvData.name} | Senior Software Engineer CV</title>
        <meta name="description" content={`Professional CV of ${cvData.name}, Senior Software Engineer with expertise in ${Object.keys(cvData.technologies).join(', ')}`} />
        <meta name="keywords" content="CV, Resume, Senior Software Engineer, Full Stack Developer" />
        <meta property="og:title" content={`${cvData.name} | Senior Software Engineer`} />
        <meta property="og:description" content={cvData.profile} />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {cvData.name}
            </h1>
            <p className="text-xl md:text-2xl text-indigo-600 font-medium mb-6">
              Senior Software Engineer
            </p>

            {/* Contact Info */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-gray-600 mb-8">
              <a href={`mailto:${cvData.contact.email}`} className="hover:text-indigo-600 transition-colors">
                {cvData.contact.email}
              </a>
              <span className="hidden md:inline">•</span>
              <a href={`tel:${cvData.contact.phone}`} className="hover:text-indigo-600 transition-colors">
                {cvData.contact.phone}
              </a>
              <span className="hidden md:inline">•</span>
              <span>{cvData.contact.citizenship}</span>
            </div>

            <div className='pb-10'>
              <SocialLinks />
            </div>

            {/* Download Buttons */}
            <div className="flex justify-center gap-4 mb-8">
              <a
                href="/cv.pdf"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                📖 View PDF
              </a>
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                ⬇️ Download PDF
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Work Experience */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Profile</h2>
                <div className="text-gray-700 leading-relaxed mb-8">
                  <AISmartHighlight priority="balanced">
                    {cvData.profile}
                  </AISmartHighlight>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">Work Experience</h2>
                <div className="space-y-8">
                  {cvData.work_experience.map((job, index) => (
                    <div key={index} className="border-l-4 border-indigo-500 pl-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {job.title} • {job.company}
                      </h3>
                      <p className="text-indigo-600 font-medium mb-2">
                        {job.location} • {job.start_date} - {job.end_date}
                      </p>
                      <ul className="text-gray-700 space-y-1 mb-4">
                        {job.responsibilities.map((resp, i) => (
                          <li key={i} className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="leading-relaxed">
                              <AISmartHighlight priority="balanced">
                                {resp}
                              </AISmartHighlight>
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Tools & Technologies:</span>{' '}
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-800">
                          {job.tools.join(', ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Skills & Projects */}
            <div className="space-y-8">
              {/* Skills */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills</h2>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Product</h3>
                  <div className="flex flex-wrap gap-2">
                    {cvData.skills.product.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Development</h3>
                  <div className="flex flex-wrap gap-2">
                    {cvData.skills.practices.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Technologies */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Technologies</h2>
                <div className="space-y-4">
                  {Object.entries(cvData.technologies).map(([category, items], index) => (
                    <div key={index}>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 capitalize">{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item, i) => (
                          <span key={i} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Projects</h2>
                <div className="space-y-4">
                  {cvData.projects.map((project, index) => (
                    <div key={index}>
                      <a
                        href={project.url}
                        className="text-lg font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                        target="_blank"
                        rel="nofollow noreferrer noopener"
                      >
                        {project.name}
                      </a>
                      <p className="text-gray-700 text-sm mt-1">{project.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Education</h2>
                <div className="space-y-4">
                  {cvData.education.map((edu, index) => (
                    <div key={index}>
                      <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.institution}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Languages</h2>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(cvData.languages).map(([language, level], index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">{language}</span>
                      <span className="text-gray-600">{level}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Publications */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Publications</h2>
                <div className="space-y-2">
                  {cvData.publications.map((pub, index) => (
                    <p key={index} className="text-gray-700 leading-relaxed">{pub}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-12">
            <Link href="/" className="inline-flex items-center px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CVWebView;
