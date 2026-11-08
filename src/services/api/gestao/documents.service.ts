import { http } from "@/services/http/client";
import type {
  DocumentCategory,
  DocumentFile,
  DocumentOwner,
  DocumentOwnerType,
  DocumentUpdateInput,
} from "@/types/document";
import type { DocumentSearch, DocumentTree } from "@/types/document-tree";

/** Uploads take longer than the default timeout on a slow connection. */
const UPLOAD_TIMEOUT = 120_000;

/** Documents of any owner: folder browser, kinds, upload, edit, delete. */
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
  async categories(ownerType: DocumentOwnerType) {
    const { data } = await http.get<{ items: DocumentCategory[] }>(
      "/document-categories",
      { params: { ownerType } },
    );
    return data.items;
  },
  /** One file per request, as the API (and the old app) do. */
  async upload(owner: DocumentOwner, file: File, categoryId?: string) {
    const body = new FormData();
    body.append("ownerType", owner.type);
    body.append("ownerId", owner.id);
    if (categoryId) body.append("categoryId", categoryId);
    body.append("file", file);
    const { data } = await http.post<DocumentFile>("/documents", body, {
      timeout: UPLOAD_TIMEOUT,
    });
    return data;
  },
  /** JSON to rename/re-kind; multipart when the file itself is replaced. */
  async update(id: string, { file, ...input }: DocumentUpdateInput) {
    if (!file) {
      const { data } = await http.patch<DocumentFile>(
        `/documents/${id}`,
        input,
      );
      return data;
    }
    const body = new FormData();
    if (input.filename !== undefined) body.append("filename", input.filename);
    // Empty `categoryId` in multipart = "Sem tipo" (the API reads "" as null).
    if (input.categoryId !== undefined) {
      body.append("categoryId", input.categoryId ?? "");
    }
    body.append("file", file);
    const { data } = await http.patch<DocumentFile>(`/documents/${id}`, body, {
      timeout: UPLOAD_TIMEOUT,
    });
    return data;
  },
  async remove(id: string) {
    await http.delete(`/documents/${id}`);
  },
};
