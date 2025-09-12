"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  File,
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { DocumentItem, DocumentViewerProps } from '../types/documents';
import { formatFileSize, getFileIconForViewer } from '../utils/fileUtils';
import { HomeButton } from './HomeButton';
import { LoadingSpinner } from './LoadingSpinner';

// Dynamic import for PDF components to avoid SSR issues
const PDFComponents = {
  Document: null as any,
  Page: null as any,
  pdfjs: null as any
};

if (typeof window !== 'undefined') {
  // Import PDF.js only on client side
  const { Document, Page, pdfjs } = require('react-pdf');
  PDFComponents.Document = Document;
  PDFComponents.Page = Page;
  PDFComponents.pdfjs = pdfjs;

  // Configure PDF.js worker only on client side
  if (PDFComponents.pdfjs) {
    PDFComponents.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${PDFComponents.pdfjs.version}/build/pdf.worker.min.mjs`;
  }
}

export function DocumentViewer({ document, loading }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotate, setRotate] = useState(0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading document:', error);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotate(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (!document) return;
    const doc = window.document;
    const link = doc.createElement('a');
    link.href = document.path;
    link.download = document.name;
    link.click();
  };

  const renderPDF = () => {
    if (!PDFComponents.Document) {
      return (
        <div className="flex items-start justify-center h-full">
          <div className="text-center space-y-4">
            <File className="w-16 h-16 text-gray-300 mx-auto" />
            <h3 className="text-lg font-medium text-gray-700">
              PDF Viewer Loading...
            </h3>
            <p className="text-gray-500 text-sm">
              Please wait while we initialize PDF rendering
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center">
        <PDFComponents.Document
          file={document!.path}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center p-8">
              <div className="text-center space-y-2">
                <LoadingSpinner />
                <p className="text-gray-600 text-sm">Loading PDF...</p>
              </div>
            </div>
          }
          error={
            <div className="flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">PDF Load Error</h3>
                  <p className="text-gray-600 text-sm">Unable to load the PDF document</p>
                </div>
              </div>
            </div>
          }
        >
          {PDFComponents.Page && numPages && Array.from(
            new Array(numPages),
            (el, index) => (
              <div key={`page_${index + 1}`} className="mb-8 first:mt-0">
                <PDFComponents.Page
                  pageNumber={index + 1}
                  scale={scale}
                  rotate={rotate}
                  loading={
                    <div className="flex items-center justify-center p-8">
                      <div className="text-center space-y-2">
                        <LoadingSpinner size="sm" />
                        <p className="text-gray-600 text-sm">Loading page {index + 1}...</p>
                      </div>
                    </div>
                  }
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-lg border border-gray-200"
                />
                <div className="text-center mt-2">
                  <span className="text-xs text-gray-500">Page {index + 1} of {numPages}</span>
                </div>
              </div>
            )
          )}
        </PDFComponents.Document>
      </div>
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
          src={document!.path}
          alt={document!.name}
          className="max-w-full max-h-full object-contain shadow-lg rounded"
          style={{
            transform: `scale(${scale}) rotate(${rotate}deg)`,
            transformOrigin: 'center center'
          }}
        />
      </motion.div>
    </div>
  );

  const renderOther = () => (
    <div className="flex items-start justify-center h-full">
      <div className="text-center space-y-4">
        <File className="w-16 h-16 text-gray-300 mx-auto" />
        <h3 className="text-lg font-medium text-gray-700">
          Preview Not Available
        </h3>
        <p className="text-gray-500 text-sm">
          {document!.name}
        </p>
        <button
          onClick={handleDownload}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Download file
        </button>
      </div>
    </div>
  );

  const renderDocumentContent = () => {
    switch (document!.type) {
      case 'pdf':
        return renderPDF();
      case 'image':
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
          <p className="text-gray-600 text-sm">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <File className="w-16 h-16 text-gray-300 mx-auto" />
          <h3 className="text-lg font-medium text-gray-700">
            Select a Document
          </h3>
          <p className="text-gray-500 text-sm">
            Choose a document from the sidebar to view its content
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Document Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white">
        <div className="flex-1 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {getFileIconForViewer(document.type)}
            <div>
              <h3 className="font-medium text-gray-900 text-sm">
                {document.name}
              </h3>
              <p className="text-xs text-gray-500">
                {formatFileSize(document.size)} •
                {document.lastModified.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Center - Home Button */}
        <div className="flex-1 flex justify-center">
          <HomeButton />
        </div>

        {/* Controls */}
        <div className="flex-1 flex items-center justify-end space-x-2">
          {/* Page Count */}
          {document.type === 'pdf' && numPages && (
            <div className="text-sm text-gray-700 px-3 py-1 bg-gray-50 rounded">
              {numPages} page{numPages !== 1 ? 's' : ''}
            </div>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center border-l pl-2 ml-2 space-x-1">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 rounded"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm px-2 text-gray-700">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 rounded"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Other Controls */}
          <div className="flex items-center border-l pl-2 ml-2 space-x-1">
            <button
              onClick={handleRotate}
              className="p-2 hover:bg-gray-100 rounded"
              title="Rotate"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {renderDocumentContent()}
      </div>
    </div>
  );
}
