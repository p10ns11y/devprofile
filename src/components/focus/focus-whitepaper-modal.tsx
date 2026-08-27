"use client";

import { Download } from "lucide-react";
import { useDialogFromSearchParam } from "@/hooks/use-dialog-from-search-param";

const WHITEPAPER_PATH = "/pdfs/EEaaS_agents_whitepaper.pdf";

export function FocusWhitepaperModal() {
  const { dialogRef, close, isOpen } = useDialogFromSearchParam("paper", {
    isOpen: (value) => value === "view",
    closePath: "/focus/eeaas-to-agents",
  });

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="focus-paper-dialog-title"
      className="cv-dialog focus-paper-dialog"
      onClose={close}
    >
      <header className="cv-dialog__bar">
        <h2 id="focus-paper-dialog-title" className="cv-dialog__title">
          EEaaS agents white paper
        </h2>
        <a
          href={WHITEPAPER_PATH}
          download="EEaaS_agents_whitepaper.pdf"
          className="cv-dialog__actions inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-text2 transition-colors hover:bg-surface2 hover:text-link focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand-emphasis)"
        >
          <Download className="size-4 shrink-0" aria-hidden="true" />
          Download
        </a>
        <form method="dialog" className="cv-dialog__close">
          <button
            type="submit"
            className="rounded-md px-3 py-1.5 text-sm text-text1 hover:bg-surface3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Close
          </button>
        </form>
      </header>
      <div className="focus-paper-dialog__body">
        {isOpen ? (
          <iframe
            key={WHITEPAPER_PATH}
            src={`${WHITEPAPER_PATH}#view=FitH`}
            title="EEaaS agents white paper"
            className="focus-paper-dialog__frame"
          />
        ) : null}
      </div>
    </dialog>
  );
}
