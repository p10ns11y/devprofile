import React, { Suspense } from 'react'

const CertificateView = React.lazy(() => import('./certificate-view'));

export default async function Certificates() {
  return (
    <div
      className="h-screen bg-background text-foreground"
    >
     <Suspense fallback="loading...">
       <CertificatesInternal />
     </Suspense>
    </div>
  );
}

async function CertificatesInternal() {
  let { documentsFlag } = await import('@/app/flags');
  let isFlagEnabled = await documentsFlag();

  if (!isFlagEnabled) {
    return <div>Feature not available</div>;
  }

  return (
    <div
      className="h-screen bg-background text-foreground"
    >
      <CertificateView />
    </div>
  );
}

