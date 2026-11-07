import type { DocumentFile } from "@/types/document";

export type DocumentTree = {
  path: string;
  /** The last one (current folder) has path null. */
  breadcrumbs: { label: string; path: string | null }[];
  folders: { label: string; count: number; path: string }[];
  /** Only in leaf folders (a category). */
  files: (DocumentFile & {
    ownerType: string;
    ownerId: string;
    signature: { requestId: string; status: string } | null;
  })[];
  owner: { type: string; id: string } | null;
};

export type DocumentSearch = {
  query: string;
  results: {
    document: DocumentFile;
    /** "Manutenções › … · PLA1012 › Manutenção 29/08/2026 › Nota Fiscal" */
    location: string;
    /** Folder that holds it. */
    path: string;
  }[];
};
