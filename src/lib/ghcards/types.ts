export type GhcardsEmbedPart = "header" | "row" | "footer" | "full";

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
  errorMessage?: string;
};
