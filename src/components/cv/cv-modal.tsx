"use client";

import { useDialogFromSearchParam } from "@/hooks/use-dialog-from-search-param";
import { CvPdfActions } from "./cv-pdf-actions";
import { CvSheet } from "./cv-sheet";

export function CvModal() {
  const { dialogRef, close } = useDialogFromSearchParam("cv", {
    isOpen: (value) => value === "view",
  });

  return (
    <dialog ref={dialogRef} aria-labelledby="cv-dialog-title" className="cv-dialog" onClose={close}>
      <header className="cv-dialog__bar">
        <h2 id="cv-dialog-title" className="cv-dialog__title">
          Curriculum vitae
        </h2>
        <CvPdfActions className="cv-dialog__actions" />
        <form method="dialog" className="cv-dialog__close">
          <button
            type="submit"
            className="rounded-md px-3 py-1.5 text-sm text-text1 hover:bg-surface3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Close
          </button>
        </form>
      </header>
      <div className="cv-dialog__body">
        <CvSheet />
      </div>
    </dialog>
  );
}
