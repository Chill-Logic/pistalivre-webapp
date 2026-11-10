import { http } from "@/services/http/client";
import type { CatalogItem, CatalogItemInput, CatalogOverview } from "@/types/catalog";

/** Vehicle catalogue (model + year with its picture). */
export const catalogService = {
  async overview() {
    const { data } = await http.get<CatalogOverview>("/catalog");
    return data;
  },
  async create(input: CatalogItemInput) {
    const { data } = await http.post<CatalogItem>("/catalog", input);
    return data;
  },
  async update(id: string, input: CatalogItemInput) {
    const { data } = await http.patch<CatalogItem>(`/catalog/${id}`, input);
    return data;
  },
  async remove(id: string) {
    await http.delete(`/catalog/${id}`);
  },
  async uploadImage(id: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    const { data } = await http.put<CatalogItem>(`/catalog/${id}/image`, form);
    return data;
  },
  async removeImage(id: string) {
    const { data } = await http.delete<CatalogItem>(`/catalog/${id}/image`);
    return data;
  },
};
