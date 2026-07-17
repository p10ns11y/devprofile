import { describe, expect, it } from "vitest";
import {
  buildApplyCvFilename,
  extractJobIdFromSourceUrl,
  resolveApplyJobId,
  slugifyFilenameSegment,
} from "./apply-cv-filename";

describe("slugifyFilenameSegment", () => {
  it("lowercases and hyphenates", () => {
    expect(slugifyFilenameSegment("Peramanathan Sathyamoorthy")).toBe(
      "peramanathan-sathyamoorthy",
    );
    expect(slugifyFilenameSegment("Exceptional Software Engineer")).toBe(
      "exceptional-software-engineer",
    );
  });
});

describe("extractJobIdFromSourceUrl", () => {
  it("reads Greenhouse job board ids", () => {
    expect(
      extractJobIdFromSourceUrl(
        "https://job-boards.greenhouse.io/xai/jobs/4956028007",
      ),
    ).toBe("4956028007");
  });

  it("returns null when absent", () => {
    expect(extractJobIdFromSourceUrl("https://example.com/careers")).toBeNull();
  });
});

describe("buildApplyCvFilename", () => {
  it("follows name-role-id.pdf", () => {
    expect(
      buildApplyCvFilename({
        personName: "Peramanathan Sathyamoorthy",
        roleTitle: "Exceptional Software Engineer",
        jobId: "4956028007",
      }),
    ).toBe(
      "peramanathan-sathyamoorthy-exceptional-software-engineer-4956028007.pdf",
    );
  });
});

describe("resolveApplyJobId", () => {
  it("prefers explicit job id, then url, then opportunity id", () => {
    expect(
      resolveApplyJobId({
        jobId: "4956028007",
        sourceUrl: "https://job-boards.greenhouse.io/xai/jobs/1",
        opportunityId: 17,
      }),
    ).toBe("4956028007");
    expect(
      resolveApplyJobId({
        sourceUrl: "https://job-boards.greenhouse.io/xai/jobs/4956028007",
        opportunityId: 17,
      }),
    ).toBe("4956028007");
    expect(resolveApplyJobId({ opportunityId: 17 })).toBe("17");
  });
});
