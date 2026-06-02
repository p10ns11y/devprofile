import { Suspense } from "react";

import CertificateView from "./certificate-view";

export default function Certificates() {
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
