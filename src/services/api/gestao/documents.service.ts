import { http } from "@/services/http/client";
import type { DocumentSearch, DocumentTree } from "@/types/document-tree";

/** Folder browser over every document owner, read-only. */
export const documentsService = {
  async tree(path: string) {
    const { data } = await http.get<DocumentTree>("/documents/tree", {
      params: path ? { path } : undefined,
    });
    return data;
  },
  async search(q: string) {
    const { data } = await http.get<DocumentSearch>("/documents/tree", {
      params: { q },
    });
    return data;
  },
};
