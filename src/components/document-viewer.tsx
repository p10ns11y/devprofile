"use client";

import { Download, File, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";

import type { DocumentViewerProps } from "../types/documents";
import { formatFileSize, getFileIconForViewer } from "../utils/file-utils";
import { HomeButton } from "./home-button";
import { LoadingSpinner } from "./loading-spinner";
import { VerificationHash } from "./verification-hash";

const DocumentViewerPdf = dynamic(
  () => import("./document-viewer-pdf").then((mod) => mod.DocumentViewerPdf),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <LoadingSpinner />
            <p className="text-gray-700 dark:text-gray-300">Loading PDF viewer...</p>
          </div>
        </div>
      </div>
    ),
  }
);

export function DocumentViewer({
  document,
  loading,
  variant = "page",
  className = "",
}: DocumentViewerProps) {
  const embedded = variant === "embedded";
  const [numPages, setNumPages] = useState<number | null>(null);
  const [_pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotate, setRotate] = useState(0);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  useEffect(() => {
    const padding = embedded ? 24 : 64;
    const maxWidth = embedded ? 920 : 800;
    const minWidth = embedded ? 380 : 300;

    const updateWidth = () => {
      const viewerElement = window.document.querySelector("[data-pdf-viewer]");
      if (viewerElement) {
        const availableWidth = viewerElement.clientWidth - padding;
        const optimalWidth = Math.min(availableWidth, maxWidth);
        setContainerWidth(Math.max(optimalWidth, minWidth));
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [embedded]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading document:", error);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotate((prev) => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (!document) return;
    const doc = window.document;
    const link = doc.createElement("a");
    link.href = document.path;
    link.download = document.name;
    link.click();
  };

  const renderPDF = () => {
    if (!document) return null;

    return (
      <Suspense
        fallback={
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center p-8">
              <div className="text-center space-y-2">
                <LoadingSpinner />
                <p className="text-gray-700 dark:text-gray-300">Loading PDF viewer...</p>
              </div>
            </div>
          </div>
        }
      >
        <DocumentViewerPdf
          document={document}
          numPages={numPages}
          scale={scale}
          rotate={rotate}
          containerWidth={containerWidth}
          onDocumentLoadSuccess={onDocumentLoadSuccess}
          onDocumentLoadError={onDocumentLoadError}
        />
      </Suspense>
    );
  };

  const renderImage = () => (
    <div className="flex justify-center items-start min-h-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-full max-h-full"
      >
        <img
          src={document?.path}
          alt={document?.name}
          className="max-w-full max-h-full object-contain shadow-lg rounded"
          style={{
            transform: `scale(${scale}) rotate(${rotate}deg)`,
            transformOrigin: "center center",
          }}
        />
      </motion.div>
    </div>
  );

  const renderOther = () => (
    <div className="flex items-start justify-center h-full">
      <div className="text-center space-y-4">
        <File className="w-16 h-16 text-text-disabled mx-auto" />
        <h3 className="text-lg font-medium text-text1">Preview Not Available</h3>
        <p className="text-text2 text-sm">{document?.name}</p>
        <button
          type="button"
          onClick={handleDownload}
          className="text-accent-primary hover:text-accent-primary/80 text-sm font-medium"
        >
          Download file
        </button>
      </div>
    </div>
  );

  const renderDocumentContent = () => {
    switch (document?.type) {
      case "pdf":
        return renderPDF();
      case "image":
        return renderImage();
      default:
        return renderOther();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-text2 text-sm">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-surface2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <File className="w-16 h-16 text-text-disabled mx-auto" />
          <h3 className="text-lg font-medium text-text1">Select a Certificate</h3>
          <p className="text-text2 text-sm">
            Choose a certificate from the sidebar to view its content
          </p>
        </motion.div>
      </div>
    );
  }

  const controls = (
    <>
      {!embedded ? <HomeButton /> : null}

      {document.type === "pdf" && numPages ? (
        <span className="text-xs text-text2 tabular-nums">{numPages}p</span>
      ) : null}

      {document.type === "pdf" ? (
        <VerificationHash key={document.id} certificateId={document.id} compact={embedded} />
      ) : null}

      <div className="flex items-center gap-0.5 border-l border-border pl-2">
        <button
          type="button"
          onClick={handleZoomOut}
          className="rounded p-1.5 hover:bg-surface3"
          title="Zoom out"
        >
          <ZoomOut className="size-4" />
        </button>
        <span className="min-w-10 text-center text-xs text-text1 tabular-nums">
          {Math.round(scale * 100)}%
        </span>
        <button
          type="button"
          onClick={handleZoomIn}
          className="rounded p-1.5 hover:bg-surface3"
          title="Zoom in"
        >
          <ZoomIn className="size-4" />
        </button>
      </div>

      <div className="flex items-center gap-0.5 border-l border-border pl-2">
        <button
          type="button"
          onClick={handleRotate}
          className="rounded p-1.5 hover:bg-surface3"
          title="Rotate"
        >
          <RotateCcw className="size-4" />
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="rounded p-1.5 hover:bg-surface3"
          title="Download"
        >
          <Download className="size-4" />
        </button>
      </div>
    </>
  );

  const toolbar = embedded ? (
    <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-b border-border bg-surface1 px-3 py-2">
      {controls}
    </div>
  ) : (
    <div className="flex flex-col gap-2 border-b border-border bg-surface1 p-4 md:flex-row md:items-center md:gap-0">
      <div className="flex flex-1 items-center space-x-4">
        <div className="flex items-center space-x-2">
          {getFileIconForViewer(document.type)}
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium text-text1">{document.name}</h3>
            <p className="hidden text-xs text-text2 sm:block">
              {formatFileSize(document.size)} • {document.lastModified.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-1 md:gap-2">{controls}</div>
    </div>
  );

  return (
    <div
      className={`flex flex-col bg-surface1 ${embedded ? "min-h-0 flex-1" : "h-screen"} ${className}`}
      data-pdf-viewer
    >
      {toolbar}
      <div className={`min-h-0 flex-1 overflow-y-auto bg-surface2 ${embedded ? "p-2" : "p-6"}`}>
        {renderDocumentContent()}
      </div>
    </div>
  );
}
