import {
  cardFooter,
  cardHeader,
  escapeXml,
  svgExternalLink,
  wrapSvg,
  wrapSvgSegment,
} from "@/app/api/ghcards/theme";
import {
  DEFAULT_USERNAME,
  parseIndex,
  parseLimit,
  parsePart,
  svgResponseHeaders,
  svgSegmentHeaders,
} from "./params";
import { getGhcardsCard } from "./registry";
import type { GhcardsEmbedCard, GhcardsEmbedPart } from "./types";

export function generateErrorSvg<T>(card: GhcardsEmbedCard<T>, message?: string): string {
  return wrapSvg(
    card.cardWidth,
    120,
    `<text x="${card.cardWidth / 2}" y="64" class="error-title" font-size="14" text-anchor="middle">${escapeXml(message ?? card.errorMessage ?? "Failed to load card")}</text>`
  );
}

export function renderHeaderSegment<T>(card: GhcardsEmbedCard<T>, username: string): string {
  const height = card.headerHeight + card.rowPadding;
  const body = cardHeader(card.cardWidth, card.headerTitle, username, card.headerHeight);
  return wrapSvgSegment(card.cardWidth, height, body, "top");
}

export function renderFooterSegment<T>(card: GhcardsEmbedCard<T>): string {
  const height = card.rowPadding + card.footerHeight;
  const body = cardFooter(card.cardWidth, height);
  return wrapSvgSegment(card.cardWidth, height, body, "bottom");
}

export function renderRowSegment<T>(card: GhcardsEmbedCard<T>, item: T, index: number): string {
  const body = `<g transform="translate(20, 2)">${card.renderRowInner(item, index)}</g>`;
  const clip = card.rowClipDef?.(index) ?? "";
  return wrapSvgSegment(card.cardWidth, card.rowHeight, body, "none", clip);
}

export function renderFullCard<T>(card: GhcardsEmbedCard<T>, items: T[], username: string): string {
  const height =
    card.headerHeight + items.length * card.rowHeight + card.rowPadding + card.footerHeight;
  const clipDefs = items.map((_, index) => card.rowClipDef?.(index) ?? "").join("");

  const rows = items
    .map((item, index) => {
      const y = card.headerHeight + card.rowPadding + index * card.rowHeight;
      const group = `<g transform="translate(20, ${y})">${card.renderRowInner(item, index)}</g>`;
      return svgExternalLink(card.resolveLink(item, username), group);
    })
    .join("");

  const body = `
    ${cardHeader(card.cardWidth, card.headerTitle, username, card.headerHeight)}
    ${rows}
    ${cardFooter(card.cardWidth, height)}
  `;

  return wrapSvg(card.cardWidth, height, body, clipDefs);
}

export async function fetchCardItems<T>(
  card: GhcardsEmbedCard<T>,
  username: string,
  limit: number
): Promise<T[]> {
  return card.fetch(username, limit);
}

export function resolveStableLinkFromCard<T>(
  card: GhcardsEmbedCard<T>,
  searchParams: URLSearchParams,
  username: string
): string | null {
  const key = card.parseStableParams(searchParams);
  if (!key) return null;
  return card.resolveStableLink(key, username);
}

export async function resolveCardLink<T>(
  card: GhcardsEmbedCard<T>,
  username: string,
  limit: number,
  index: number
): Promise<string | null> {
  const items = await fetchCardItems(card, username, limit);
  const item = items[index];
  if (!item) return null;
  return card.resolveLink(item, username);
}

type EmbedQuery = {
  cardId: string;
  username: string;
  limit: number;
  part: GhcardsEmbedPart | null;
  index: number | null;
};

function parseEmbedQuery(request: Request, cardIdOverride?: string): EmbedQuery | Response {
  const { searchParams } = new URL(request.url);
  const cardId = cardIdOverride ?? searchParams.get("card");
  if (!cardId) {
    return new Response("Missing card", { status: 400 });
  }

  const card = getGhcardsCard(cardId);
  if (!card) {
    return new Response(`Unknown card: ${cardId}`, { status: 404 });
  }

  const username = searchParams.get("username") || DEFAULT_USERNAME;
  const limit = parseLimit(searchParams.get("limit"), card.defaultLimit, card.maxLimit);
  const part = parsePart(searchParams.get("part"));
  const index = parseIndex(searchParams.get("index"));

  return { cardId, username, limit, part, index };
}

export async function handleEmbedRequest(
  request: Request,
  cardIdOverride?: string
): Promise<Response> {
  const parsed = parseEmbedQuery(request, cardIdOverride);
  if (parsed instanceof Response) return parsed;

  const card = getGhcardsCard(parsed.cardId);
  if (!card) {
    return new Response(`Unknown card: ${parsed.cardId}`, { status: 404 });
  }

  try {
    if (parsed.part === "header") {
      return new Response(renderHeaderSegment(card, parsed.username), {
        headers: svgSegmentHeaders,
      });
    }

    if (parsed.part === "footer") {
      return new Response(renderFooterSegment(card), { headers: svgSegmentHeaders });
    }

    if (parsed.part === "row") {
      if (parsed.index === null) {
        return new Response(generateErrorSvg(card, "Missing or invalid index"), {
          headers: { "Content-Type": "image/svg+xml" },
          status: 400,
        });
      }

      const items = await fetchCardItems(card, parsed.username, card.maxLimit);
      const item = items[parsed.index];
      if (!item) {
        return new Response(generateErrorSvg(card, "Row not found"), {
          headers: { "Content-Type": "image/svg+xml" },
          status: 404,
        });
      }

      return new Response(renderRowSegment(card, item, parsed.index), {
        headers: svgSegmentHeaders,
      });
    }

    const items = await fetchCardItems(card, parsed.username, parsed.limit);
    return new Response(renderFullCard(card, items, parsed.username), {
      headers: svgResponseHeaders,
    });
  } catch {
    return new Response(generateErrorSvg(card), {
      headers: { "Content-Type": "image/svg+xml" },
    });
  }
}

export async function handleGoRequest(
  request: Request,
  cardIdOverride?: string
): Promise<Response> {
  const parsed = parseEmbedQuery(request, cardIdOverride);
  if (parsed instanceof Response) return parsed;

  const card = getGhcardsCard(parsed.cardId);
  if (!card) {
    return new Response(`Unknown card: ${parsed.cardId}`, { status: 404 });
  }

  const { searchParams } = new URL(request.url);

  try {
    const stableUrl = resolveStableLinkFromCard(card, searchParams, parsed.username);
    if (stableUrl) {
      return Response.redirect(stableUrl, 302);
    }

    if (parsed.index === null) {
      return new Response("Missing stable key or index", { status: 400 });
    }

    const url = await resolveCardLink(card, parsed.username, card.maxLimit, parsed.index);
    if (!url) {
      return new Response("Row not found", { status: 404 });
    }
    return Response.redirect(url, 302);
  } catch {
    return new Response("Failed to resolve link", { status: 500 });
  }
}
