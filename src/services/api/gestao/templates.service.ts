import { http } from "@/services/http/client";
import type {
  ContractTemplate,
  ContractTemplateDetail,
  InspectionRequirements,
} from "@/types/template";

/** Contract and inspection templates, read-only. */
export const templatesService = {
  async contracts() {
    const { data } = await http.get<{ items: ContractTemplate[] }>(
      "/contract-templates",
    );
    return data.items;
  },
  async contract(id: string) {
    const { data } = await http.get<ContractTemplateDetail>(
      `/contract-templates/${id}`,
    );
    return data;
  },
  async inspection() {
    const { data } = await http.get<InspectionRequirements>(
      "/inspection-requirements",
    );
    return data;
  },
};
