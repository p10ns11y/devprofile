"use client";

import Link from "next/link";
import { GitHubLiveDashboardHost } from "@/components/github-live-dashboard-host";
import { useDialogFromSearchParam } from "@/hooks/use-dialog-from-search-param";

const GITHUB_USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? "p10ns11y";

export function BuildingActivityModal() {
  const { dialogRef, close } = useDialogFromSearchParam("building", {
    isOpen: (value) => value === "view",
  });

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="building-dialog-title"
      className="cv-dialog building-dialog"
      onClose={close}
    >
      <header className="cv-dialog__bar">
        <h2 id="building-dialog-title" className="cv-dialog__title">
          What I&apos;m shipping
        </h2>
        <Link href="/building" className="text-sm text-[var(--color-link)] hover:underline">
          Landscape
        </Link>
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
        <p className="building-dialog__lede">
          Live repos from{" "}
          <a href={`https://github.com/${GITHUB_USERNAME}`}>{GITHUB_USERNAME}</a>
          . Same dashboard as{" "}
          <a href="/status/code/200">/status/code/200</a>.
        </p>
        <GitHubLiveDashboardHost username={GITHUB_USERNAME} />
      </div>
    </dialog>
  );
}
