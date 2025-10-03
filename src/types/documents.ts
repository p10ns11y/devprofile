export interface DocumentItem {
  id: string;
  name: string;
  path: string;
  type: 'pdf' | 'image' | 'text' | 'other';
  size: number;
  lastModified: Date;
  thumbnail?: string;
  verifyUrl?: string;
  completionDate?: string;
  reissuedDate?: string;
  explanationUrl?: string;
}

export interface DocumentSidebarProps {
  documents: DocumentItem[];
  selectedDocument: DocumentItem | null;
  onDocumentSelect: (document: DocumentItem) => void;
  loading?: boolean;
}

export interface DocumentViewerProps {
  document: DocumentItem | null;
  loading?: boolean;
}