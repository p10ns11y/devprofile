"use client";

import { Download, FileText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/components/ui/utils";

const actionClass =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-text2 transition-colors hover:bg-surface2 hover:text-link focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-brand-emphasis)";

type CvPdfActionsProps = {
  className?: string;
  /** Stack vertically in mobile nav */
  layout?: "row" | "column";
};

export function CvPdfActions({ className, layout = "row" }: CvPdfActionsProps) {
  return (
    <fieldset
      className={cn(
        "flex min-w-0 gap-1 border-0 p-0 m-0",
        layout === "column" ? "flex-col w-full" : "items-center",
        className
      )}
    >
      <legend className="sr-only">CV PDF</legend>
      <Link href="/api/cv/view" target="_blank" rel="noopener noreferrer" className={actionClass}>
        <FileText className="size-4 shrink-0" aria-hidden="true" />
        View PDF
      </Link>
      <a
        href="/api/cv/download"
        download="peramanathan-sathyamoorthy-cv.pdf"
        className={actionClass}
      >
        <Download className="size-4 shrink-0" aria-hidden="true" />
        Download
      </a>
    </fieldset>
  );
}
