import "server-only";

import crypto from "node:crypto";
import { type CertificateHashAlgorithmId, hashAlgorithmLabel } from "../digest/algorithms";
import { bytesToHex } from "../digest/bytes-to-hex";

export type ServerHashProvider = {
  id: CertificateHashAlgorithmId;
  label: string;
  digest: (data: Buffer) => Promise<string> | string;
};

const providers = new Map<CertificateHashAlgorithmId, ServerHashProvider>();

function register(provider: ServerHashProvider) {
  providers.set(provider.id, provider);
}

register({
  id: "sha256",
  label: hashAlgorithmLabel("sha256"),
  digest: (data) => bytesToHex(new Uint8Array(crypto.createHash("sha256").update(data).digest())),
});

/** Register BLAKE3 (or others) at startup, e.g. `registerServerHashProvider({ id: 'blake3', ... })`. */
export function registerServerHashProvider(provider: ServerHashProvider): void {
  register(provider);
}

export function getServerHashProvider(
  algorithm: CertificateHashAlgorithmId
): ServerHashProvider | undefined {
  return providers.get(algorithm);
}

export function listConfiguredServerAlgorithms(): CertificateHashAlgorithmId[] {
  return [...providers.keys()];
}

export async function digestCertificateFileOnServer(
  algorithm: CertificateHashAlgorithmId,
  fileBuffer: Buffer
): Promise<string> {
  const provider = providers.get(algorithm);
  if (!provider) {
    throw new Error(
      `Hash algorithm "${algorithm}" is not configured on the server. Register a provider via registerServerHashProvider.`
    );
  }
  const hex = await provider.digest(fileBuffer);
  return hex.toLowerCase();
}
