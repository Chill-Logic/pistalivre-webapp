import { http } from "@/services/http/client";
import type {
  ContractTemplate,
  ContractTemplateDetail,
  ContractTemplateInput,
  InspectionPolicy,
  InspectionPolicyInput,
  InspectionRequirement,
  InspectionRequirementInput,
  InspectionRequirements,
  ProposalTemplateDetail,
  ProposalTemplateInput,
  ProposalTemplateSummary,
  TemplateVariableCatalog,
} from "@/types/template";

/**
 * Contract and proposal templates (CRUD + variable catalogs) and the
 * inspection templates (items per vehicle type + the cadence).
 */
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
  /** Adds an item at the END of the vehicle type's list. */
  async createRequirement(input: InspectionRequirementInput) {
    const { data } = await http.post<InspectionRequirement>(
      "/inspection-requirements",
      input,
    );
    return data;
  },
  async removeRequirement(id: string) {
    await http.delete(`/inspection-requirements/${id}`);
  },
  async updatePolicy(input: InspectionPolicyInput) {
    const { data } = await http.put<InspectionPolicy>(
      "/inspection-policy",
      input,
    );
    return data;
  },
  /** Every proposal template, active or not (the models screen). */
  async proposals() {
    const { data } = await http.get<{ items: ProposalTemplateSummary[] }>(
      "/proposal-templates",
      { params: { active: "all" } },
    );
    return data.items;
  },
  async proposal(id: string) {
    const { data } = await http.get<ProposalTemplateDetail>(
      `/proposal-templates/${id}`,
    );
    return data;
  },
  /** Every save bumps the version; issued proposals keep their snapshot. */
  async createProposal(input: ProposalTemplateInput) {
    const { data } = await http.post<ProposalTemplateDetail>(
      "/proposal-templates",
      input,
    );
    return data;
  },
  async updateProposal(id: string, input: ProposalTemplateInput) {
    const { data } = await http.put<ProposalTemplateDetail>(
      `/proposal-templates/${id}`,
      input,
    );
    return data;
  },
  async removeProposal(id: string) {
    await http.delete(`/proposal-templates/${id}`);
  },
  /** Same format as the contract catalog; the slot is `{{{clauses}}}`. */
  async proposalVariables() {
    const { data } = await http.get<TemplateVariableCatalog>(
      "/proposal-templates/variables",
    );
    return data;
  },
};
