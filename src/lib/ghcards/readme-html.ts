import { fetchCardItems } from "./embed";
import { getGhcardsCard } from "./registry";
import type { GhcardsEmbedCard } from "./types";

type ReadmeHtmlOptions = {
  baseUrl: string;
  cardId: string;
  username: string;
  limit: number;
  cacheBuster?: string;
};

function apiUrl(baseUrl: string, path: string, params: Record<string, string>): string {
  const url = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export function generateReadmeHtmlFromItems<T>(
  card: GhcardsEmbedCard<T>,
  items: T[],
  { baseUrl, cardId, username, limit, cacheBuster }: ReadmeHtmlOptions
): string {
  const v = cacheBuster ?? String(Date.now());
  const common = { card: cardId, username, v };

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

  const rows = items
    .map((item, index) => {
      const stable = card.stableKey(item, username);
      const linkHref = apiUrl(baseUrl, "/api/ghcards/go", {
        card: cardId,
        username,
        ...stable,
      });
      const rowSrc = apiUrl(baseUrl, "/api/ghcards/embed", {
        ...common,
        part: "row",
        index: String(index),
      });

      return `  <a href="${linkHref}" target="_blank" rel="noopener noreferrer">
    <img src="${rowSrc}" width="${card.cardWidth}" height="${card.rowHeight}" alt="" />
  </a>`;
    })
    .join("\n");

  return `<p>
  <img src="${headerSrc}" width="${card.cardWidth}" alt="${card.headerTitle}" />
${rows}
  <img src="${footerSrc}" width="${card.cardWidth}" alt="" />
</p>`;
}

export async function generateReadmeHtml(options: ReadmeHtmlOptions): Promise<string> {
  const card = getGhcardsCard(options.cardId);
  if (!card) {
    throw new Error(`Unknown card: ${options.cardId}`);
  }

  const items = await fetchCardItems(card, options.username, options.limit);
  return generateReadmeHtmlFromItems(card, items, options);
}

export async function handleReadmeHtmlRequest(request: Request): Promise<Response> {
  const { searchParams, origin } = new URL(request.url);
  const cardId = searchParams.get("card");
  const username = searchParams.get("username") || "p10ns11y";
  const baseUrl = searchParams.get("base") || origin;
  const limitRaw = searchParams.get("limit");
  const cacheBuster = searchParams.get("v") || undefined;

  if (!cardId) {
    return new Response("Missing card", { status: 400 });
  }

  const card = getGhcardsCard(cardId);
  if (!card) {
    return new Response(`Unknown card: ${cardId}`, { status: 404 });
  }

  const limit = Math.min(parseInt(limitRaw || String(card.defaultLimit), 10), card.maxLimit);

  try {
    const html = await generateReadmeHtml({ baseUrl, cardId, username, limit, cacheBuster });
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
