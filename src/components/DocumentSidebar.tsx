"use client";

import React from 'react';
import {
  File as FileIcon,
  Clock,
  HardDrive
} from 'lucide-react';
import { motion } from 'motion/react';
import { DocumentItem, DocumentSidebarProps } from '../types/documents';
import { formatFileSize, getFileIcon } from '../utils/fileUtils';
import { LoadingSpinner } from './LoadingSpinner';


export function DocumentSidebar({
  documents,
  selectedDocument,
  onDocumentSelect,
  loading
}: DocumentSidebarProps) {
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
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Documents
        </h2>
        <p className="text-sm text-gray-600">
          {documents.length} file{documents.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
        {documents.map((document) => (
          <motion.div
            key={document.id}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedDocument?.id === document.id
                ? 'bg-blue-50 border-l-4 border-l-blue-500'
                : ''
            }`}
            onClick={() => onDocumentSelect(document)}
            whileHover={{ scale: 0.99 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start space-x-3">
              {/* File Icon */}
              <div className={`flex-shrink-0 mt-1 ${
                selectedDocument?.id === document.id ? 'border-2 border-blue-500 rounded' : ''
              }`}>
                {getFileIcon(document.type)}
              </div>

              {/* File Details */}
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-medium truncate ${
                  selectedDocument?.id === document.id
                    ? 'text-blue-900'
                    : 'text-gray-900'
                }`}>
                  {document.name}
                </h3>

                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <HardDrive className="w-3 h-3" />
                    <span>{formatFileSize(document.size)}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {document.lastModified.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* File Type Badge */}
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    document.type === 'pdf'
                      ? 'bg-red-100 text-red-800'
                      : document.type === 'image'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {document.type.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {documents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <FileIcon className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-sm text-gray-500 font-medium mb-2">
              No Documents Found
            </h3>
            <p className="text-xs text-gray-400 text-center">
              Documents will appear here when available
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Select a document to view content
        </p>
      </div>
    </div>
  );
}
