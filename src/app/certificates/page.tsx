import { Suspense } from "react";

import CertificateView from "./certificate-view";

export default async function Certificates() {
  const { documentsFlag } = await import("@/app/flags");
  const isFlagEnabled = await documentsFlag();

  if (!isFlagEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface1 text-text1">
        Feature not available
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface1 text-text2 p-8">Loading certificates…</div>
      }
    >
      <CertificateView />
    </Suspense>
  );
}
