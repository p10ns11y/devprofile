"use client";

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldX,
  Shield,
  Copy,
  Check,
  Info,
  X
} from 'lucide-react';

interface VerificationHashProps {
  certificateId: string;
}

export function VerificationHash({ certificateId }: VerificationHashProps) {
  const [currentHash, setCurrentHash] = useState<string | null>(null);
  const [expectedHash, setExpectedHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed' | null>(null);
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Get expected hash from cvdata
  const getExpectedHash = () => {
    // Import cvdata dynamically to avoid SSR issues
    import('@/data/cvdata.json').then((cvData) => {
      // Find certificate by ID
      for (let index = 0; index < cvData.certificates.length; index++) {
        const cert = cvData.certificates[index];
        const filenameWithoutExt = cert.filename.replace(/\.[^/.]+$/, '');
        const sanitizedName = filenameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const uniqueId = `cert-${sanitizedName}-${index}`;

        if (uniqueId === certificateId && cert.sha256Hash) {
          setExpectedHash(cert.sha256Hash);
          break;
        }
      }
    });
  };

// Helper to find certificate hash by ID
const findCertificateHash = async (certId: string): Promise<string | null> => {
  const cvData = await import('@/data/cvdata.json');
  for (let index = 0; index < cvData.certificates.length; index++) {
    const cert = cvData.certificates[index];
    const filenameWithoutExt = cert.filename.replace(/\.[^/.]+$/, '');
    const sanitizedName = filenameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const uniqueId = `cert-${sanitizedName}-${index}`;
    if (uniqueId === certId && cert.sha256Hash) {
      return cert.sha256Hash;
    }
  }
  return null;
};

const verifyHash = async () => {
  if (currentHash && expectedHash) return; // Prevent re-verification

  setLoading(true);
  try {
    const response = await fetch(`/api/certificates/${certificateId}/hash`);
    if (response.ok) {
      const data = await response.json();
      setCurrentHash(data.hash);

      // Get expected hash if not already loaded
      if (!expectedHash) {
        const hash = await findCertificateHash(certificateId);
        if (hash) {
          setExpectedHash(hash);
        }
      }
    }
  } catch (error) {
    console.error('Failed to verify hash:', error);
    setVerificationStatus('failed');
  } finally {
    setLoading(false);
  }
};

// elsewhere in the same file:

// const getExpectedHash = () => {
//   findCertificateHash(certificateId).then(hash => {
//     if (hash) {
//       setExpectedHash(hash);
//     }
//   });
// };

  // Reset state and load expected hash when certificate changes
  React.useEffect(() => {
    // Reset all state when certificate changes
    setCurrentHash(null);
    setExpectedHash(null);
    setVerificationStatus(null);
    setLoading(false);
    setCopied(false);

    // Load expected hash for new certificate
    getExpectedHash();
  }, [certificateId]);

  // Automatically verify when both hashes are available
  React.useEffect(() => {
    if (currentHash && expectedHash && !verificationStatus) {
      const status = currentHash === expectedHash ? 'verified' : 'failed';
      setVerificationStatus(status);
    }
  }, [currentHash, expectedHash, verificationStatus]);

  const copyToClipboard = async () => {
    if (!expectedHash) return;

    try {
      await navigator.clipboard.writeText(expectedHash);
      setCopied(true);
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Failed to copy hash:', error);
    }
  };

  const displayHash = expectedHash ? `${expectedHash.slice(0, 16)}...` : '';

  return (
    <>
      <div className="flex items-center space-x-2 bg-surface3 px-3 py-2 rounded-lg border border-border">
        <div className="flex-shrink-0">
          {verificationStatus === 'verified' ? (
            <ShieldCheck className="w-5 h-5 text-accent-secondary fill-current" />
          ) : verificationStatus === 'failed' ? (
            <ShieldX className="w-5 h-5 text-accent-primary fill-current" />
          ) : (
            <Shield className="w-5 h-5 text-accent-primary" />
          )}
        </div>
        <button
          onClick={verifyHash}
          disabled={loading}
          className="text-sm text-text1 hover:text-accent-primary underline disabled:opacity-50"
        >
          {loading ? 'Verifying...' : verificationStatus === 'verified' ? '✓ Verified' : verificationStatus === 'failed' ? '✗ Failed' : 'Verify'}
        </button>

        {expectedHash && (
          <>
            <span className="text-sm text-text2 font-mono">{displayHash}</span>
            <button
              onClick={copyToClipboard}
              className="text-accent-primary hover:text-accent-primary/80"
              title="Copy expected hash"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowInfo(true)}
              className="text-accent-primary hover:text-accent-primary/80"
              title="Verification details"
            >
              <Info className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Info Overlay */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInfo(false)}>
          <div className="bg-surface1 p-6 rounded-lg max-w-2xl mx-auto border border-border max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text1 flex items-center gap-2">
                <Shield className="w-6 h-6 text-accent-primary" />
                Document Verification
              </h3>
              <button
                onClick={() => setShowInfo(false)}
                className="text-text2 hover:text-text1 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-text2">
              <div className="bg-surface3 p-4 rounded-lg">
                <h4 className="font-semibold text-text1 mb-2">SHA-256 Hash</h4>
                <p>A cryptographic fingerprint of this document that uniquely identifies its content.</p>
              </div>

              <div>
                <h4 className="font-semibold text-text1 mb-2">How to Verify</h4>
                <p className="mb-3">
                  Compute the SHA-256 hash of your downloaded document file using built-in tools on your operating system, then compare it exactly (case-insensitive) to the official hash below. If they match, the document is authentic and unmodified.
                </p>

                <div className="bg-surface3 p-4 rounded-lg mb-4">
                  <p className="font-medium text-text1 mb-2">Follow these practical steps:</p>
                  <ol className="list-decimal list-inside space-y-2 text-xs">
                    <li>Ensure you have the exact file (e.g., PDF) downloaded from a trusted source—double-check the URL and use HTTPS to avoid tampering during transit.</li>
                    <li>Open a terminal or command prompt:</li>
                  </ol>

                  <div className="mt-3 space-y-2">
                    <div className="bg-surface2 p-2 rounded text-xs font-mono">
                      <strong className="text-accent-primary">Windows:</strong> certutil -hashfile "path\to\your\file" SHA256
                    </div>
                    <div className="bg-surface2 p-2 rounded text-xs font-mono">
                      <strong className="text-accent-primary">macOS:</strong> shasum -a 256 "path/to/your/file"
                    </div>
                    <div className="bg-surface2 p-2 rounded text-xs font-mono">
                      <strong className="text-accent-primary">Linux:</strong> sha256sum "path/to/your/file"
                    </div>
                  </div>

                  <ol className="list-decimal list-inside space-y-2 text-xs mt-3" start={3}>
                    <li>Paste and compare the computed hash to the official one. Use a text editor for side-by-side comparison to avoid visual errors.</li>
                    <li>If they don't match, redownload from the official source or contact the issuer—mismatches could indicate corruption, tampering, or a scam (e.g., fake documents from phishing sites).</li>
                  </ol>
                </div>
              </div>

              <div className="bg-accent-secondary/10 p-4 rounded-lg border border-accent-secondary/20">
                <h4 className="font-semibold text-accent-secondary mb-2">⚠️ Risks and Tips</h4>
                <p className="text-xs text-accent-secondary">
                  This verifies integrity but not the issuer's authenticity; always cross-check the hash source (e.g., via official website). Avoid online hash tools for sensitive files, as uploading exposes content to potential breaches. No current tech makes hashes "unbreakable," but SHA-256 is secure against practical attacks today—stay pragmatic and update if vulnerabilities emerge.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-text1 mb-2">Why This Matters</h4>
                <p>Any change to the document (even a single character) will produce a completely different hash, making forgery detectable.</p>
              </div>

              <div className="space-y-3">
                <div className="bg-surface3 p-4 rounded-lg">
                  <div className="font-medium text-text1 mb-2">Expected Hash (from issuer):</div>
                  {expectedHash ? (
                    <div className="break-all text-xs font-mono bg-surface2 p-2 rounded border select-all">
                      {expectedHash}
                    </div>
                  ) : (
                    <div className="text-text-disabled text-xs italic">Expected hash not available</div>
                  )}
                </div>

                <div className="bg-surface3 p-4 rounded-lg">
                  <div className="font-medium text-text1 mb-2">Current File Hash:</div>
                  {currentHash ? (
                    <div className="break-all text-xs font-mono bg-surface2 p-2 rounded border select-all">
                      {currentHash}
                    </div>
                  ) : (
                    <div className="text-text-disabled text-xs italic">Click "Verify" to calculate current hash</div>
                  )}
                </div>

                {verificationStatus && (
                  <div className={`p-4 rounded-lg border ${
                    verificationStatus === 'verified'
                      ? 'bg-accent-secondary/10 border-accent-secondary/20'
                      : 'bg-accent-primary/10 border-accent-primary/20'
                  }`}>
                    <div className={`font-medium mb-2 ${
                      verificationStatus === 'verified'
                        ? 'text-accent-secondary'
                        : 'text-accent-primary'
                    }`}>
                      {verificationStatus === 'verified' ? '✅ Verification Successful' : '❌ Verification Failed'}
                    </div>
                    <p className={`text-xs ${
                      verificationStatus === 'verified'
                        ? 'text-accent-secondary'
                        : 'text-accent-primary'
                    }`}>
                      {verificationStatus === 'verified'
                        ? 'The document matches the expected hash from the issuer. This certificate is authentic and unmodified.'
                        : 'The document hash does not match the expected hash. This could indicate tampering, corruption, or an incorrect file.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}