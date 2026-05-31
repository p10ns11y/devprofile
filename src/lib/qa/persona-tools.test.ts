import { describe, expect, it } from "vitest";
import {
  __TEST_ONLY_formatSearchResults,
  aiPersonaTools,
  personaToolRegistry,
} from "./persona-tools";

describe("Scenario S6: six persona tools for visitor grounding", () => {
  it("registry has exactly six tools", () => {
    expect(Object.keys(personaToolRegistry).sort()).toEqual([
      "educationAndBackground",
      "principlesAndPhilosophy",
      "profileSearch",
      "projects",
      "skills",
      "workExperience",
    ]);
  });

  it("aiPersonaTools exposes the same six keys", () => {
    expect(Object.keys(aiPersonaTools).sort()).toEqual(Object.keys(personaToolRegistry).sort());
  });

  it("formatSearchResults handles empty chunks", () => {
    const out = __TEST_ONLY_formatSearchResults({ chunks: [], citations: [] });
    expect(out).toMatch(/No matching excerpts/);
  });
});
