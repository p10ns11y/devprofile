import React from 'react';
import {
  FileText,
  ImageIcon,
  File
} from 'lucide-react';

export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export const getFileIcon = (type: string): React.JSX.Element => {
  switch (type) {
    case 'pdf':
      return React.createElement(FileText, { className: "w-5 h-5 text-red-500" });
    case 'image':
      return React.createElement(ImageIcon, { className: "w-5 h-5 text-blue-500" });
    case 'text':
      return React.createElement(FileText, { className: "w-5 h-5 text-green-500" });
    default:
      return React.createElement(File, { className: "w-5 h-5 text-gray-500" });
  }
};

export const getFileIconForViewer = (type: string): React.JSX.Element => {
  switch (type) {
    case 'pdf':
      return React.createElement(File, { className: "w-6 h-6 text-red-500" });
    case 'image':
      return React.createElement(File, { className: "w-6 h-6 text-blue-500" });
    default:
      return React.createElement(File, { className: "w-6 h-6 text-gray-500" });
  }
};