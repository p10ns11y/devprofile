import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import cvdata from "@/data/cvdata.json";
import {
  extractCvPdfContract,
  KANITHANJ_PUBLIC_LINE,
} from "@/lib/cv-pdf-contract";

const pinnedPath = join(process.cwd(), "src/data/cv-pdf-contract.json");

describe("cv PDF contract", () => {
  it("matches the pinned contract extracted from cvdata", () => {
    const extracted = extractCvPdfContract();
    const pinned = JSON.parse(readFileSync(pinnedPath, "utf8"));
    expect(extracted).toEqual(pinned);
  });

  it("keeps the v2 summary and the approved Kanithanj line, without overclaims", () => {
    const contract = extractCvPdfContract();
    const bios = [cvdata.profile].join("\n");

    expect(contract.headline).toBe(
      "Senior Product and Systems Engineer · AI/SI agentic workflows"
    );
    expect(contract.summary).toContain("founding the Integration Team");
    expect(contract.summary).toContain(
      "independently on AI/SI product and systems engineering for agentic workflows"
    );
    expect(contract.kanithanj).toContain(KANITHANJ_PUBLIC_LINE);
    expect(contract.ensembly_bullets).toHaveLength(3);
    expect(contract.ensembly_bullets.join("\n")).toContain("operator kernel");
    expect(bios).not.toMatch(/ReactJS/);
    expect(bios).not.toMatch(/innovative startups/);
    expect(bios).not.toContain("ran the public API");
    expect(cvdata.current_role).toBe(
      "Independent AI/SI product and systems engineering (agentic workflows)"
    );
    expect(cvdata.main_role).toBe(cvdata.current_role);
  });
});
