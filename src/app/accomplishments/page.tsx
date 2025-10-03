import { Accomplishments } from '@/components/accomplishments';

export const metadata = {
  title: 'Accomplishments - Peramanathan Sathyamoorthy',
  description: 'Professional certifications and course completions in technology, cloud platforms, and AI',
};

export default function AccomplishmentsPage() {
  return (
    <div className="min-h-screen bg-surface1 text-text1">
      <div className="pt-20"></div> {/* Spacer for fixed header */}
      <Accomplishments />
    </div>
  );
}
