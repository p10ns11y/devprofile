/** Lowercase hex encoding for digests (shared by client and server hash providers). */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function normalizeDigestHex(hex: string): string {
  return hex.trim().toLowerCase();
}

export function digestsMatch(a: string, b: string): boolean {
  return normalizeDigestHex(a) === normalizeDigestHex(b);
}
