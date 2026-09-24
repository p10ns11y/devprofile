import { evidencePageHref, QA_EVIDENCE_PAGES, type QaEvidencePageLink } from "./evidence-pages";

export type MatchedEvidencePageLink = QaEvidencePageLink & {
  href: string;
  score: number;
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function keywordScore(keyword: string, haystack: string): number {
  const normalized = keyword
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  if (!normalized || !haystack.includes(normalized)) {
    return 0;
  }
  return normalized.split(/\s+/).filter(Boolean).length;
}

function scoreLink(link: QaEvidencePageLink, haystack: string): number {
  return link.keywords.reduce((total, keyword) => total + keywordScore(keyword, haystack), 0);
}

export function matchEvidencePages(
  question: string,
  answer: string,
  max = 3
): MatchedEvidencePageLink[] {
  const haystack = normalizeText(`${question} ${answer}`);

  return QA_EVIDENCE_PAGES.map((link) => ({ link, score: scoreLink(link, haystack) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.link.id.localeCompare(b.link.id))
    .slice(0, max)
    .map(({ link, score }) => ({
      ...link,
      href: evidencePageHref(link),
      score,
    }));
}
