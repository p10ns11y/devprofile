import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PersonJsonLd } from "@/components/person-json-ld";

describe("PersonJsonLd", () => {
  it("renders a ProfilePage graph with the current headline and no overclaims", () => {
    const html = renderToStaticMarkup(PersonJsonLd());
    expect(html).toContain("application/ld+json");
    const match = html.match(/<script[^>]*>({[\s\S]*})<\/script>/);
    expect(match).not.toBeNull();
    const json = JSON.parse(match?.[1] ?? "{}") as {
      "@graph": Array<Record<string, unknown>>;
    };
    const graph = json["@graph"] ?? [];
    const byType = Object.fromEntries(graph.map((node) => [String(node["@type"]), node]));
    const person = byType.Person as {
      jobTitle: string;
      sameAs: string[];
      description: string;
      mainEntityOfPage: string;
      nationality?: unknown;
      knowsAbout: unknown[];
    };
    const paper2015 = graph.find(
      (node) => node["@type"] === "ScholarlyArticle" && String(node.name).includes("Orchestration")
    ) as { name: string };

    expect(byType.ProfilePage).toBeDefined();
    expect(byType.SoftwareSourceCode).toBeDefined();
    expect(person.jobTitle).toBe("Senior Product and Systems Engineer · AI/SI agentic workflows");
    expect(person.sameAs).toContain("https://www.linkedin.com/in/sathyam-peram/");
    expect(person.sameAs.join(" ")).not.toContain("npmjs.com");
    expect(person.nationality).toBeUndefined();
    expect(person.description).toContain("AI/SI agentic workflows");
    expect(person.description).toContain("EU work authorised, no sponsorship needed");
    expect(person.description).toContain("can start within two weeks of an offer");
    expect(person.description).not.toContain("ran the public API");
    expect(person.description).not.toContain("kanithanj.ai");
    expect(person.mainEntityOfPage).toBe("https://captain.kingsparrow.space/llms.txt");
    expect(html).toContain("https://captain.kingsparrow.space/#person");
    expect(html).not.toContain("Family care");
    expect(html).not.toContain("family-care");
    expect(html).not.toContain("85k");
    expect(JSON.stringify(person.knowsAbout)).toContain("saving network energy");
    expect(paper2015.name).toBe(
      "Energy Efficiency as an Orchestration Service for Mobile Internet of Things"
    );
  });
});
