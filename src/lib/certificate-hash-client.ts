import { bytesToHex } from "@/lib/bytes-to-hex";
import type { CertificateHashAlgorithmId } from "@/lib/certificate-hash-algorithms";
import { hashAlgorithmLabel } from "@/lib/certificate-hash-algorithms";

export type ClientHashProvider = {
  id: CertificateHashAlgorithmId;
  label: string;
  digest: (data: ArrayBuffer) => Promise<string>;
};

const providers = new Map<CertificateHashAlgorithmId, ClientHashProvider>();

function register(provider: ClientHashProvider) {
  providers.set(provider.id, provider);
}

register({
  id: "sha256",
  label: hashAlgorithmLabel("sha256"),
  digest: async (data) => {
    const hash = await crypto.subtle.digest("SHA-256", data);
    return bytesToHex(new Uint8Array(hash));
  },
});

export function registerClientHashProvider(provider: ClientHashProvider): void {
  register(provider);
}

export function isClientHashAlgorithmSupported(algorithm: CertificateHashAlgorithmId): boolean {
  return providers.has(algorithm);
}

export async function digestCertificateBytesInBrowser(
  algorithm: CertificateHashAlgorithmId,
  data: ArrayBuffer
): Promise<string> {
  const provider = providers.get(algorithm);
  if (!provider) {
    throw new Error(
      `Hash algorithm "${algorithm}" is not available in the browser. Register a client provider via registerClientHashProvider.`
    );
  }
  return (await provider.digest(data)).toLowerCase();
}
