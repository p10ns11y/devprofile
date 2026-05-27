import { runProfileQA } from "@/lib/qa/profile-qa-generator";
import { qaCache } from "@/utils/qa-utils";

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    if (!question) {
      return new Response(JSON.stringify({ message: "Query required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (qaCache.has(question)) {
      const cachedResponse = qaCache.get(question);
      return new Response(JSON.stringify(cachedResponse), {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    const response = await runProfileQA(question);
    qaCache.set(question, response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
