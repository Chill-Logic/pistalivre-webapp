import { http } from "@/services/http/client";
import type {
  ContractTemplate,
  ContractTemplateDetail,
  ContractTemplateInput,
  InspectionRequirements,
  TemplateVariableCatalog,
} from "@/types/template";

/** Contract templates (CRUD + variable catalog) and inspection templates. */
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
  /** Every save bumps the version; issued contracts keep their snapshot. */
  async createContract(input: ContractTemplateInput) {
    const { data } = await http.post<ContractTemplateDetail>(
      "/contract-templates",
      input,
    );
    return data;
  },
  async updateContract(id: string, input: ContractTemplateInput) {
    const { data } = await http.put<ContractTemplateDetail>(
      `/contract-templates/${id}`,
      input,
    );
    return data;
  },
  async removeContract(id: string) {
    await http.delete(`/contract-templates/${id}`);
  },
  async variables() {
    const { data } = await http.get<TemplateVariableCatalog>(
      "/contract-templates/variables",
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
