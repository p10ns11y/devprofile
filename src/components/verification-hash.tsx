"use client";

import { Check, Copy, Info, Shield, ShieldCheck, ShieldX, X } from "lucide-react";
import { useState } from "react";
import { hashAlgorithmLabel } from "@/lib/certificate-hash-algorithms";
import { digestCertificateBytesInBrowser } from "@/lib/certificate-hash-client";
import {
  deriveVerificationStatus,
  finalizeHostedVerification,
  type HostedVerificationResult,
} from "@/lib/certificate-verification";

interface VerificationHashProps {
  certificateId: string;
  documentPath: string;
  compact?: boolean;
}

type ServerVerifyPayload = Omit<HostedVerificationResult, "clientDigest" | "match" | "clientMatchesExpected"> & {
  algorithmLabel?: string;
  timestamp?: string;
};

export function VerificationHash({
  certificateId,
  documentPath,
  compact = false,
}: VerificationHashProps) {
  const [result, setResult] = useState<HostedVerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const verificationStatus = deriveVerificationStatus(result, fetchFailed);
  const algorithmLabel = result ? hashAlgorithmLabel(result.algorithm) : "SHA-256";

  const checkHostedFile = async () => {
    setLoading(true);
    setFetchFailed(false);
    setResult(null);

    try {
      const response = await fetch(
        `/api/certificates/${encodeURIComponent(certificateId)}/verify`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        setFetchFailed(true);
        return;
      }

      const serverPayload = (await response.json()) as ServerVerifyPayload;

      if (!serverPayload.clientSupported) {
        setFetchFailed(true);
        return;
      }

      const fileResponse = await fetch(documentPath, { cache: "no-store" });
      if (!fileResponse.ok) {
        setFetchFailed(true);
        return;
      }

      const bytes = await fileResponse.arrayBuffer();
      const clientDigest = await digestCertificateBytesInBrowser(
        serverPayload.algorithm,
        bytes
      );

      setResult(finalizeHostedVerification(serverPayload, clientDigest));
    } catch (error) {
      console.error("Failed to check hosted file:", error);
      setFetchFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const copyExpectedDigest = async () => {
    if (!result?.expectedDigest) return;

    try {
      await navigator.clipboard.writeText(result.expectedDigest);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy hash:", error);
    }
  };

  const displayHash = result?.expectedDigest ? `${result.expectedDigest.slice(0, 16)}...` : "";

  return (
    <>
      <div
        className={`flex items-center justify-between gap-1.5 rounded-lg border border-border bg-surface3 ${
          compact ? "px-2 py-1" : "space-x-2 px-3 py-2"
        }`}
      >
        <button
          type="button"
          onClick={checkHostedFile}
          disabled={loading}
          className="flex items-center space-x-2 cursor-pointer disabled:cursor-not-allowed"
        >
          <div className="flex-shrink-0">
            {verificationStatus === "verified" ? (
              <ShieldCheck className="w-5 h-5 text-accent-secondary fill-current" />
            ) : verificationStatus === "failed" ? (
              <ShieldX className="w-5 h-5 text-accent-primary fill-current" />
            ) : (
              <Shield className="w-5 h-5 text-accent-primary" />
            )}
          </div>
          <span className="text-sm text-text1 hover:text-accent-primary underline disabled:opacity-50">
            {loading
              ? "Checking..."
              : verificationStatus === "verified"
                ? "✓ Verified"
                : verificationStatus === "failed"
                  ? "✗ Failed"
                  : "Check hosted file"}
          </span>
        </button>

        {result?.expectedDigest ? (
          <>
            <span className="text-sm text-text2 font-mono break-all max-w-20 md:max-w-none">
              {displayHash}
            </span>
            <button
              type="button"
              onClick={copyExpectedDigest}
              className="text-accent-primary hover:text-accent-primary/80 flex-shrink-0"
              title="Copy expected digest"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setShowInfo(true)}
              className="text-accent-primary hover:text-accent-primary/80 flex-shrink-0"
              title="Verification details"
            >
              <Info className="w-4 h-4" />
            </button>
          </>
        ) : null}
      </div>

      {showInfo ? (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="bg-surface1 p-6 rounded-lg max-w-2xl mx-auto border border-border max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text1 flex items-center gap-2">
                <Shield className="w-6 h-6 text-accent-primary" />
                Document verification
              </h3>
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                className="text-text2 hover:text-text1 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-text2">
              <div className="bg-surface3 p-4 rounded-lg">
                <h4 className="font-semibold text-text1 mb-2">{algorithmLabel} digest</h4>
                <p>
                  A cryptographic fingerprint of this document. The site publishes the expected
                  digest; Check hosted file hashes the same file URL shown in the viewer and
                  compares it to that value.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-text1 mb-2">Check hosted file</h4>
                <p className="mb-3">
                  Confirms the certificate file served at this URL matches the digest stored for this
                  site. It does not hash a file already saved on your device.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-text1 mb-2">Verify a download offline</h4>
                <p className="mb-3">
                  After downloading, compute the digest locally and compare to the expected value
                  below.
                </p>
                {result?.algorithm === "sha256" ? (
                  <div className="bg-surface3 p-4 rounded-lg space-y-2 text-xs font-mono">
                    <div>
                      <strong className="text-accent-primary">Windows:</strong> certutil -hashfile
                      &quot;path\to\file&quot; SHA256
                    </div>
                    <div>
                      <strong className="text-accent-primary">macOS:</strong> shasum -a 256
                      &quot;path/to/file&quot;
                    </div>
                    <div>
                      <strong className="text-accent-primary">Linux:</strong> sha256sum
                      &quot;path/to/file&quot;
                    </div>
                  </div>
                ) : (
                  <p className="text-xs italic">
                    Use a {algorithmLabel} tool for your platform; this algorithm is not covered by
                    the built-in OS commands above.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="bg-surface3 p-4 rounded-lg">
                  <div className="font-medium text-text1 mb-2">Expected digest (published):</div>
                  {result?.expectedDigest ? (
                    <div className="break-all text-xs font-mono bg-surface2 p-2 rounded border select-all">
                      {result.expectedDigest}
                    </div>
                  ) : (
                    <div className="text-text-disabled text-xs italic">
                      Run Check hosted file first
                    </div>
                  )}
                </div>

                <div className="bg-surface3 p-4 rounded-lg">
                  <div className="font-medium text-text1 mb-2">Hosted file digest (browser):</div>
                  {result?.clientDigest ? (
                    <div className="break-all text-xs font-mono bg-surface2 p-2 rounded border select-all">
                      {result.clientDigest}
                    </div>
                  ) : (
                    <div className="text-text-disabled text-xs italic">Not calculated yet</div>
                  )}
                </div>

                {verificationStatus ? (
                  <div
                    className={`p-4 rounded-lg border ${
                      verificationStatus === "verified"
                        ? "bg-accent-secondary/10 border-accent-secondary/20"
                        : "bg-accent-primary/10 border-accent-primary/20"
                    }`}
                  >
                    <div
                      className={`font-medium mb-2 ${
                        verificationStatus === "verified"
                          ? "text-accent-secondary"
                          : "text-accent-primary"
                      }`}
                    >
                      {verificationStatus === "verified"
                        ? "Hosted file matches published digest"
                        : "Digest mismatch"}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
