import type { Metadata } from "next";
import { HireLanding } from "@/components/hire/hire-landing";
import { getHireContent } from "@/lib/hire-content";

export const metadata: Metadata = {
  title: "Hire landing — φ-flow | Peramanathan Sathyamoorthy",
  description: getHireContent().contactLead,
  robots: { index: false, follow: false },
};

export default function LabHirePage() {
  return <HireLanding content={getHireContent()} labNotice />;
}
