import { recentPrsCard } from "./cards/recent-prs";
import { recentPushedCard } from "./cards/recent-pushed";
import type { GhcardsEmbedCard } from "./types";

const cards = [recentPushedCard, recentPrsCard] as GhcardsEmbedCard<unknown>[];

const byId = new Map(cards.map((card) => [card.id, card]));

export function listGhcards(): GhcardsEmbedCard<unknown>[] {
  return cards;
}

export function getGhcardsCard(id: string): GhcardsEmbedCard<unknown> | null {
  return byId.get(id) ?? null;
}
