"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import { DocumentViewer } from "@/components/document-viewer";
import { PageShell } from "@/components/site/PageShell";
import { SectionHeading } from "@/components/site/SectionHeading";
import cvdata from "@/data/cvdata.json";
import { getCertificatesData } from "@/data/documents-data";
import type { DocumentItem } from "@/types/documents";

const certificates = getCertificatesData();

const courseMeta = new Map(cvdata.certificates.map((cert) => [cert.filename, cert.course]));

type DialogState = { open: boolean; selectedId: string | null };

type DialogAction =
  | { type: "OPEN"; id: string }
  | { type: "CLOSE" }
  | { type: "SYNC_URL"; id: string | null };

function dialogReducer(_state: DialogState, action: DialogAction): DialogState {
  switch (action.type) {
    case "OPEN":
      return { open: true, selectedId: action.id };
    case "CLOSE":
      return { open: false, selectedId: null };
    case "SYNC_URL":
      return action.id ? { open: true, selectedId: action.id } : { open: false, selectedId: null };
    default:
      return _state;
  }
}

function displayName(cert: DocumentItem) {
  return courseMeta.get(cert.name) ?? cert.name.replace(/\.[^.]+$/, "").replace(/-/g, " ");
}

function formatDate(date?: string) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function CertificateViewComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const certId = searchParams?.get("id") ?? null;

  const selectedCertificate = useMemo(() => {
    if (certId) {
      const cert = certificates.find((c) => c.id === certId);
      if (cert) return cert;
    }
    return null;
  }, [certId]);

  const [state, dispatch] = useReducer(dialogReducer, {
    open: Boolean(certId && selectedCertificate),
    selectedId: selectedCertificate?.id ?? null,
  });

  useEffect(() => {
    if (certId && selectedCertificate) {
      dispatch({ type: "SYNC_URL", id: certId });
    } else if (!certId) {
      dispatch({ type: "CLOSE" });
    }
  }, [certId, selectedCertificate]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (state.open && state.selectedId) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [state.open, state.selectedId]);

  const openCertificate = useCallback(
    (id: string) => {
      dispatch({ type: "OPEN", id });
      router.replace(`?id=${id}`, { scroll: false });
    },
    [router]
  );

  const closeDialog = useCallback(() => {
    dispatch({ type: "CLOSE" });
    router.replace("/certificates", { scroll: false });
  }, [router]);

  const activeCert =
    certificates.find((c) => c.id === state.selectedId) ?? selectedCertificate ?? null;

  return (
    <PageShell>
      <div className="pt-[var(--header-offset)] pb-16 min-w-0">
        <div className="container mx-auto min-w-0 max-w-7xl px-4 sm:px-6">
          <SectionHeading
            id="certificates-heading"
            title="Certificates"
            description="Browse professional certifications and course completions."
            className="pt-8"
          />

          <ul role="list" className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {certificates.map((cert) => (
              <li key={cert.id}>
                <article
                  data-card="credential"
                  data-cert-id={cert.id}
                  className="h-full rounded-xl border-2 border-border bg-surface2 p-5 flex flex-col gap-3"
                >
                  <h2 className="font-semibold text-text1 text-base leading-snug">
                    {displayName(cert)}
                  </h2>
                  {cert.completionDate ? (
                    <p className="text-xs text-text2">
                      Completed {formatDate(cert.completionDate)}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => openCertificate(cert.id)}
                    className="mt-auto text-left text-sm text-brand hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    Open certificate
                  </button>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        data-state={state.open ? "open" : "closed"}
        aria-labelledby="cert-dialog-title"
        className="w-[min(100vw-2rem,56rem)] max-h-[90vh] rounded-xl border border-border bg-surface1 p-0 backdrop:bg-black/50 open:flex open:flex-col"
        onClose={closeDialog}
      >
        <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
          <h2 id="cert-dialog-title" className="font-semibold text-text1 truncate">
            {activeCert ? displayName(activeCert) : "Certificate"}
          </h2>
          <form method="dialog">
            <button
              type="submit"
              className="rounded-md px-3 py-1.5 text-sm text-text1 hover:bg-surface3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Close
            </button>
          </form>
        </header>
        <div className="overflow-y-auto flex-1 p-4">
          {activeCert ? <DocumentViewer document={activeCert} /> : null}
        </div>
      </dialog>
    </PageShell>
  );
}
