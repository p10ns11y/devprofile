export type GhcardsEmbedPart = "header" | "row" | "footer" | "full";

export type GhcardsStableKey = Record<string, string>;

export type GhcardsEmbedCard<T> = {
  id: string;
  headerTitle: string;
  cardWidth: number;
  headerHeight: number;
  rowHeight: number;
  rowPadding: number;
  footerHeight: number;
  defaultLimit: number;
  maxLimit: number;
  fetch: (username: string, limit: number) => Promise<T[]>;
  rowClipDef?: (index: number) => string;
  renderRowInner: (item: T, index: number) => string;
  resolveLink: (item: T, username: string) => string;
  stableKey: (item: T, username: string) => GhcardsStableKey;
  parseStableParams: (searchParams: URLSearchParams) => GhcardsStableKey | null;
  resolveStableLink: (key: GhcardsStableKey, username: string) => string | null;
  errorMessage?: string;
};
