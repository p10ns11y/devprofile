import AICHAT from "@/components/ai-chat";
import { getFeatureDisclaimer, isFeatureInDevelopment } from "@/config/feature-flags";
import { AlertTriangle } from 'lucide-react';
import { askQuestion } from '@/app/actions';

export default async function AMA() {
  let amaDisclaimer;
  const isAmaInDevelopment = isFeatureInDevelopment('ama');

  if (isAmaInDevelopment) {
    amaDisclaimer = getFeatureDisclaimer('ama');
  }

  return (
    <div className="min-h-screen bg-brand text-text1 overflow-hidden">
      {/* Development Disclaimer */}
      {isAmaInDevelopment && amaDisclaimer && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mx-4 mt-4 rounded-r-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Development Feature</p>
              <p>{amaDisclaimer}</p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        <AICHAT submitAction={askQuestion} />
      </main>
    </div>
  );
}
