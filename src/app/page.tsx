import "@/styles/hire-phi-flow.css";

import { HireLanding } from "@/components/hire/hire-landing";
import { getHireContent } from "@/lib/hire-content";

export default function Home() {
  return <HireLanding content={getHireContent()} />;
}
