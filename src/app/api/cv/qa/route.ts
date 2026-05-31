import { QaValidationError, handleQaRequest } from "@/lib/qa/gateway/handle-qa-request";

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    if (!question) {
      return new Response(JSON.stringify({ message: "Query required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined;

    const { body, responseHeaders } = await handleQaRequest(question, {
      ip,
      headers: request.headers,
    });

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    if (error instanceof QaValidationError) {
      return new Response(JSON.stringify({ message: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
