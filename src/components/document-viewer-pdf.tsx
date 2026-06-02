"use client";

import { AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import type { DocumentItem } from "../types/documents";
import { LoadingSpinner } from "./loading-spinner";

export interface PageDimensions {
  width: number;
  height: number;
}

export interface DocumentViewerPdfProps {
  document: DocumentItem;
  numPages: number | null;
  scale: number;
  rotate: number;
  containerWidth: number;
  onDocumentLoadSuccess: (info: { numPages: number }) => void;
  onDocumentLoadError: (error: Error) => void;
  /** First page intrinsic size (scale 1) — used for fit-to-container in modals */
  onFirstPageDimensions?: (dimensions: PageDimensions) => void;
}

export function DocumentViewerPdf({
  document,
  numPages,
  scale,
  rotate,
  containerWidth,
  onDocumentLoadSuccess,
  onDocumentLoadError,
  onFirstPageDimensions,
}: DocumentViewerPdfProps) {
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }, []);

  return (
    <div className="flex flex-col items-center">
      <Document
        file={document.path}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={
          <div className="flex items-center justify-center p-8">
            <div className="text-center space-y-2">
              <LoadingSpinner />
              <p className="text-text1">Loading PDF...</p>
            </div>
          </div>
        }
        error={
          <div className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-text1">PDF Load Error</h3>
                <p className="text-text2 text-sm">Unable to load the PDF document</p>
              </div>
            </div>
          </div>
        }
      >
        {numPages &&
          Array.from(new Array(numPages), (_el, index) => (
            <div key={`page_${index + 1}`} className="mb-8 first:mt-0 [&:only-child]:mb-0">
              <Page
                pageNumber={index + 1}
                scale={scale}
                rotate={rotate}
                width={containerWidth}
                onLoadSuccess={
                  index === 0
                    ? (page) => {
                        const viewport = page.getViewport({ scale: 1 });
                        onFirstPageDimensions?.({
                          width: viewport.width,
                          height: viewport.height,
                        });
                      }
                    : undefined
                }
                loading={
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center space-y-2">
                      <LoadingSpinner size="sm" />
                      <p className="text-text2 text-sm">Loading page {index + 1}...</p>
                    </div>
                  </div>
                }
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-lg border border-gray-200"
              />
              <div className="text-center mt-2">
                <span className="text-xs text-text2">
                  Page {index + 1} of {numPages}
                </span>
              </div>
            </div>
          ))}
      </Document>
    </div>
  );
}
