import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HireLanding } from "@/components/hire/hire-landing";
import {
  getHireStressContent,
  type HireStressFixture,
  hireStressFixtures,
} from "@/lib/hire-stress-fixtures";

type PageProps = {
  params: Promise<{ fixture: string }>;
};

function isStressFixture(value: string): value is HireStressFixture {
  return hireStressFixtures.some((f) => f.slug === value);
}

export async function generateStaticParams() {
  return hireStressFixtures.map((f) => ({ fixture: f.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { fixture } = await params;
  if (!isStressFixture(fixture)) {
    return { title: "Stress fixture not found" };
  }
  const label = hireStressFixtures.find((f) => f.slug === fixture)?.label ?? fixture;
  return {
    title: `Stress: ${label} | Lab`,
    robots: { index: false, follow: false },
  };
}

export default async function StressFixturePage({ params }: PageProps) {
  const { fixture } = await params;
  if (!isStressFixture(fixture)) {
    notFound();
  }
  return <HireLanding content={getHireStressContent(fixture)} labNotice />;
}
