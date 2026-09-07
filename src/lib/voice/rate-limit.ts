const buckets = new Map<string, number[]>();

export function resetVoiceRateLimitForTests(): void {
  buckets.clear();
}

export function checkVoiceRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

export function extractClientIp(request: Request): string | undefined {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    undefined
  );
}
