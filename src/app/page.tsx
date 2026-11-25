import type { Metadata } from "next";
import { HireLanding } from "@/components/hire/hire-landing";
import { PersonJsonLd } from "@/components/person-json-ld";
import { getHireContent } from "@/lib/hire-content";
import { parseHireVisualLanguage } from "@/lib/hire-visual-language";
import { PRODUCTION_SITE_ORIGIN, siteOg } from "@/lib/site-url";

const pageTitle =
  "Peramanathan Sathyamoorthy: Senior Product and Systems Engineer · AI/SI agentic workflows";
const pageDescription =
  "Senior Product and Systems Engineer · AI/SI agentic workflows, in Stockholm. TypeScript, React, Next.js, Node.js, and LLM tooling. Maintainer of adaptate. EU work authorised; can start within two weeks.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: `${PRODUCTION_SITE_ORIGIN}/`,
    types: {
      "text/plain": "/llms.txt",
    },
  },
  openGraph: {
    type: "profile",
    firstName: "Peramanathan",
    lastName: "Sathyamoorthy",
    title: pageTitle,
    description: pageDescription,
    url: `${PRODUCTION_SITE_ORIGIN}/`,
    siteName: siteOg.siteName,
    locale: siteOg.locale,
  },
};

type HomeProps = {
  searchParams: Promise<{ vl?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  return (
    <>
      <PersonJsonLd />
      <HireLanding content={getHireContent()} visualLanguage={parseHireVisualLanguage(params.vl)} />
    </>
  );
}
