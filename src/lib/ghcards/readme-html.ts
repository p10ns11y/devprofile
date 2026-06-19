import { getGhcardsCard } from "./registry";

type ReadmeHtmlOptions = {
  baseUrl: string;
  cardId: string;
  username: string;
  limit: number;
};

function apiUrl(baseUrl: string, path: string, params: Record<string, string>): string {
  const url = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export function generateReadmeHtml({ baseUrl, cardId, username, limit }: ReadmeHtmlOptions): string {
  const card = getGhcardsCard(cardId);
  if (!card) {
    throw new Error(`Unknown card: ${cardId}`);
  }

  const common = { card: cardId, username };
  const headerSrc = apiUrl(baseUrl, "/api/ghcards/embed", {
    ...common,
    limit: String(limit),
    part: "header",
  });
  const footerSrc = apiUrl(baseUrl, "/api/ghcards/embed", {
    ...common,
    limit: String(limit),
    part: "footer",
  });

  const rows = Array.from({ length: limit }, (_, index) => {
    const rowSrc = apiUrl(baseUrl, "/api/ghcards/embed", {
      ...common,
      part: "row",
      index: String(index),
    });
    const linkHref = apiUrl(baseUrl, "/api/ghcards/go", {
      ...common,
      index: String(index),
    });

    return `  <a href="${linkHref}">
    <img src="${rowSrc}" width="${card.cardWidth}" height="${card.rowHeight}" alt="" />
  </a>`;
  }).join("\n");

  return `<p>
  <img src="${headerSrc}" width="${card.cardWidth}" alt="${card.headerTitle}" />
${rows}
  <img src="${footerSrc}" width="${card.cardWidth}" alt="" />
</p>`;
}

export function handleReadmeHtmlRequest(request: Request): Response {
  const { searchParams, origin } = new URL(request.url);
  const cardId = searchParams.get("card");
  const username = searchParams.get("username") || "p10ns11y";
  const baseUrl = searchParams.get("base") || origin;
  const limitRaw = searchParams.get("limit");

  if (!cardId) {
    return new Response("Missing card", { status: 400 });
  }

  const card = getGhcardsCard(cardId);
  if (!card) {
    return new Response(`Unknown card: ${cardId}`, { status: 404 });
  }

  const limit = Math.min(
    parseInt(limitRaw || String(card.defaultLimit), 10),
    card.maxLimit
  );

  try {
    const html = generateReadmeHtml({ baseUrl, cardId, username, limit });
    return new Response(html, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate README HTML";
    return new Response(message, { status: 500 });
  }
}
