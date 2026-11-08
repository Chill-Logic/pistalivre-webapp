import type {
  DocumentFile,
  DocumentOwnerType,
  DocumentSignature,
} from "@/types/document";

export type DocumentTree = {
  path: string;
  /** The last one (current folder) has path null. */
  breadcrumbs: { label: string; path: string | null }[];
  folders: { label: string; count: number; path: string }[];
  /** Only in leaf folders (a category). */
  files: (DocumentFile & {
    ownerType: string;
    ownerId: string;
    signature: DocumentSignature | null;
  })[];
  /** Whose files these are (leaf folders): lets the staff manage them. */
  owner: { type: DocumentOwnerType; id: string } | null;
};

export type DocumentSearch = {
  query: string;
  results: {
    document: DocumentFile & { ownerType: DocumentOwnerType; ownerId: string };
    /** "Manutenções › … · PLA1012 › Manutenção 29/08/2026 › Nota Fiscal" */
    location: string;
    /** Folder that holds it. */
    path: string;
  }[];
};
