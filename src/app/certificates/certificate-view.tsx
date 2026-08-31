"use client";

import { ArrowRight } from "lucide-react";
import { useMemo } from "react";

import { DocumentViewer } from "@/components/document-viewer";
import { EarnedCourseCards } from "@/components/earned-course-cards";
import { PageShell } from "@/components/site/PageShell";
import { SectionHeading } from "@/components/site/SectionHeading";
import cvdata from "@/data/cvdata.json";
import { getCertificatesData } from "@/data/documents-data";
import { landingInvite } from "@/data/landing-invite";
import { useDialogFromSearchParam } from "@/hooks/use-dialog-from-search-param";
import { visibleCertificateIds } from "@/lib/certificates";
import type { DocumentItem } from "@/types/documents";
import { formatFileSize } from "@/utils/file-utils";

const certificates = getCertificatesData();
const certificateIds = visibleCertificateIds();

const courseMeta = new Map(cvdata.certificates.map((cert) => [cert.filename, cert.course]));

function displayName(cert: DocumentItem) {
  return courseMeta.get(cert.name) ?? cert.name.replace(/\.[^.]+$/, "").replace(/-/g, " ");
}

function formatDate(date?: string) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function CertificateViewComponent() {
  const {
    dialogRef,
    paramValue: certId,
    open: openCertificate,
    close: closeDialog,
  } = useDialogFromSearchParam("id", {
    closePath: "/certificates",
    isOpen: (id) => id !== null && certificateIds.has(id),
  });

  const activeCert = useMemo(
    () => (certId ? (certificates.find((c) => c.id === certId) ?? null) : null),
    [certId]
  );

  return (
    <PageShell>
      <div className="pt-[var(--header-offset)] pb-16 min-w-0">
        <div className="container mx-auto min-w-0 max-w-7xl px-4 sm:px-6">
          <SectionHeading
            id="certificates-heading"
            title="Earned"
            description={landingInvite.credentialsQuote}
            className="pt-8"
            headingLevel="h1"
          />

          <EarnedCourseCards headingId="earned-courses-heading" />

          <section className="credentials-block" aria-labelledby="earned-certificates-heading">
            <h2 id="earned-certificates-heading" className="subsection-title subsection-heading">
              Certificates
            </h2>

            <ul role="list" className="credentials-grid" data-grid="catalog">
            {certificates.map((cert) => (
              <li key={cert.id} className="min-w-0">
                <button
                  type="button"
                  data-card="credential"
                  data-action="open"
                  data-cert-id={cert.id}
                  className="credential-card"
                  onClick={() => openCertificate(cert.id)}
                  aria-label={`View certificate: ${displayName(cert)}`}
                >
                  <span className="credential-card__title">{displayName(cert)}</span>
                  <span className="credential-card__foot">
                    {cert.completionDate ? (
                      <span className="credential-card__date">
                        {formatDate(cert.completionDate)}
                      </span>
                    ) : (
                      <span className="credential-card__date" data-empty aria-hidden="true" />
                    )}
                    <span className="credential-card__cta">
                      View
                      <ArrowRight className="credential-card__cta-icon" aria-hidden="true" />
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          </section>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="cert-dialog-title"
        className="cert-dialog"
        onClose={closeDialog}
      >
        {activeCert ? (
          <>
            <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <h2 id="cert-dialog-title" className="truncate font-semibold text-text1">
                  {displayName(activeCert)}
                </h2>
                <p className="mt-0.5 truncate text-xs text-text2">
                  {activeCert.name} · {formatFileSize(activeCert.size)}
                  {" · "}
                  {formatDate(activeCert.completionDate) ??
                    activeCert.lastModified.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                </p>
              </div>
              <form method="dialog" className="shrink-0">
                <button
                  type="submit"
                  className="rounded-md px-3 py-1.5 text-sm text-text1 hover:bg-surface3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Close
                </button>
              </form>
            </header>
            <DocumentViewer document={activeCert} variant="embedded" className="min-h-0 flex-1" />
          </>
        ) : null}
      </dialog>
    </PageShell>
  );
}
