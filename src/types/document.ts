export type DocumentFile = {
  id: string;
  category: { name: string } | null;
  fileName: string;
  contentType: string;
  size: number;
  /** Relative to the API server root (`/api/files/<key>`), not to `/api`. */
  url: string;
  createdAt: string;
};
