/** Known hire-page visual-language packs (θ). Production `/` stays the default. */
export const HIRE_VISUAL_LANGUAGES = ["colorfigures"] as const;

export type HireVisualLanguage = (typeof HIRE_VISUAL_LANGUAGES)[number];

export function parseHireVisualLanguage(
  raw: string | string[] | undefined | null
): HireVisualLanguage | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) {
    return null;
  }
  return (HIRE_VISUAL_LANGUAGES as readonly string[]).includes(value)
    ? (value as HireVisualLanguage)
    : null;
}
