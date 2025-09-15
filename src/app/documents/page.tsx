import React, { Suspense } from 'react'

const DocumentView = React.lazy(() => import('./document-view'));

export default async function Documents() {
  return (
    <div
      className="h-screen bg-background text-foreground"
    >
     <Suspense fallback="loading...">
       <DocumentsInternal />
     </Suspense>
    </div>
  );
}

async function DocumentsInternal() {
  let { exampleFlag } = await import('@/app/flags');
  let isFlagEnabled = await exampleFlag();

  if (!isFlagEnabled) {
    return <div>Feature not available</div>;
  }

  return (
    <div
      className="h-screen bg-background text-foreground"
    >
      <DocumentView />
    </div>
  );
}

