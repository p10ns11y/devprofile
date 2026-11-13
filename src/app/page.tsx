import { HireLanding } from "@/components/hire/hire-landing";
import { getHireContent } from "@/lib/hire-content";
import { parseHireVisualLanguage } from "@/lib/hire-visual-language";

type HomeProps = {
  searchParams: Promise<{ vl?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  return (
    <HireLanding content={getHireContent()} visualLanguage={parseHireVisualLanguage(params.vl)} />
  );
}
