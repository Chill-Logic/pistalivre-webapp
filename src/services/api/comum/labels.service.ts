import { http } from "@/services/http/client";
import type { LabelCatalog } from "@/types/labels";

export const labelsService = {
  async catalog() {
    const { data } = await http.get<LabelCatalog>("/labels");
    return data;
  },
};
