'use client'

import { useState } from 'react';
import QuestionAnswer from "@/components/question-answer";
import { getFeatureDisclaimer, isFeatureInDevelopment } from "@/config/feature-flags";
import { AlertTriangle } from 'lucide-react';

import cvdata from "@/data/cvdata.json"

export default function QuickCVActions() {
  const [showQA, setShowQA] = useState(false);
  const qaDisclaimer = getFeatureDisclaimer('qa');
  const isQaInDevelopment = isFeatureInDevelopment('qa');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {showQA ? (
        <div className="mb-6">
          <button
            onClick={() => setShowQA(false)}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
          >
            ← Back to CV
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {cvdata.name}
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                {cvdata.latest_proffessional_role}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {cvdata.short_bio}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="/cv.pdf"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                👁️ View CV
              </a>

              <a
                href="/cv.pdf"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                download="peramanathan-sathyamoorthy-cv.pdf"
              >
                ⬇️ Download CV
              </a>

              <button
                onClick={() => setShowQA(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                🤖 Ask AI Questions
              </button>
            </div>

            {/* Development Disclaimer for QA Feature */}
            {isQaInDevelopment && qaDisclaimer && (
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">AI Question Answering Feature</p>
                    <p>{qaDisclaimer}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showQA && <QuestionAnswer />}
    </div>
  );
}
