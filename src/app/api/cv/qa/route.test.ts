import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("Scenario S1: POST /api/cv/qa", () => {
  it("returns 400 when question is missing", async () => {
    const res = await POST(
      new Request("http://localhost/api/cv/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns answer JSON for a valid question", async () => {
    const res = await POST(
      new Request("http://localhost/api/cv/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: "What is your professional background?" }),
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.answer).toBe("string");
    expect(Array.isArray(body.details)).toBe(true);
  });
});
