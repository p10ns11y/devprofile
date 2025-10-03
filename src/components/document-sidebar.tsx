"use client";

import React, { useEffect } from 'react';
import {
  File as FileIcon,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { DocumentItem, DocumentSidebarProps } from '../types/documents';
import { formatFileSize, getFileIcon } from '../utils/file-utils';
import { LoadingSpinner } from './loading-spinner';


export function DocumentSidebar({
  documents,
  selectedDocument,
  onDocumentSelect,
  loading
}: DocumentSidebarProps) {
  // Scroll selected item into view
  useEffect(() => {
    if (selectedDocument) {
      const element = document.querySelector(
        `[data-cert-id="${CSS.escape(selectedDocument.id)}"]`
      );
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedDocument]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }
  

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-text1">
          Certificates
        </h2>
        <p className="text-sm text-text2">
          {documents.length} certificate{documents.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
        {documents.map((document) => (
          <div key={document.id}>
            <motion.div
              data-cert-id={document.id}
              className={`p-4 border-b border-border cursor-pointer hover:bg-surface3 transition-colors ${
                selectedDocument?.id === document.id
                  ? 'bg-surface2 border-l-4 border-l-accent-primary'
                  : ''
              }`}
              onClick={() => onDocumentSelect(document)}
              whileHover={{ scale: 0.99 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start space-x-3">
                {/* File Icon */}
                <div className={`flex-shrink-0 mt-1 ${
                  selectedDocument?.id === document.id ? 'border-2 border-accent-primary rounded' : ''
                }`}>
                  {getFileIcon(document.type)}
                </div>

                {/* File Details */}
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-medium truncate ${
                    selectedDocument?.id === document.id
                      ? 'text-text1'
                      : 'text-text1'
                  }`}>
                    {document.name}
                  </h3>

                  <div className="flex items-center space-x-4 mt-1 text-xs text-text2">
                     <div className="flex items-center space-x-1">
                       <Clock className="w-3 h-3" />
                       <span>
                         {document.reissuedDate ? `Reissued: ${document.reissuedDate}` : document.lastModified.toLocaleDateString()}
                       </span>
                     </div>
                   </div>

                   {/* Completion Date */}
                   {document.reissuedDate && document.completionDate && (
                     <div className="mt-1 text-xs text-text2">
                       Completed: {document.completionDate}
                     </div>
                   )}
                   {document.verifyUrl && (
                     <div className="mt-2">
                       <a
                         href={document.verifyUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         aria-label={`Verify certificate for ${document.name}`}
                         onClick={(e) => {
                           const url = new URL(document.verifyUrl as string, window.location.href);
                           if (!['http:', 'https:'].includes(url.protocol)) {
                             e.preventDefault();
                             console.error('Invalid URL scheme');
                           }
                         }}
                         className="text-xs text-accent-primary hover:text-accent-primary/80 underline"
                       >
                         Verify Certificate
                       </a>
                     </div>
                   )}
                </div>
              </div>
            </motion.div>


            {/* Explanation Link - Outside clickable area */}
            {selectedDocument?.id === document.id && document.explanationUrl && (
              <div className="px-4 pb-4">
                <a
                  href={document.explanationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Certificate reissue explanation for ${document.name}`}
                  onClick={(e) => {
                    const url = new URL(document.explanationUrl as string, window.location.href);
                    if (!['http:', 'https:'].includes(url.protocol)) {
                      e.preventDefault();
                      console.error('Invalid URL scheme');
                    }
                  }}
                  className="text-xs text-accent-primary hover:text-accent-primary/80 underline"
                >
                  Certificate Reissue Explanation
                </a>
              </div>
            )}
          </div>
        ))}

        {documents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <FileIcon className="w-12 h-12 text-text-disabled mb-4" />
            <h3 className="text-sm text-text2 font-medium mb-2">
              No Certificates Found
            </h3>
            <p className="text-xs text-text-disabled text-center">
              Certificates will appear here when available
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-text2">
          Select a certificate to view content
        </p>
      </div>
    </div>
  );
}
