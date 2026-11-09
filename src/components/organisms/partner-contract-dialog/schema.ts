import { z } from "zod";
import type {
  PartnerContract,
  PartnerContractInput,
  PartnerContributionType,
  PartnerShareBase,
} from "@/types/partner";
import { todayInBrasilia } from "@/utils/date";
import { parsePercentInput, percentInputOf } from "@/utils/percent";

/** Radix select reserves "": the "no value" entry of the payout day. */
export const NO_DAY = "__none__";

const percentText = z.string().refine((text) => {
  const value = parsePercentInput(text);
  return (
    value === null || (Number.isFinite(value) && value >= 0 && value <= 100)
  );
}, "Percentual inválido");

/** Mirrors the API's partnerContractSchema (same PT messages). */
export const contractFormSchema = z
  .object({
    type: z.enum(["INVESTMENT", "MANAGEMENT"], {
      errorMap: () => ({ message: "Escolha o tipo do contrato" }),
    }),
    contributionType: z.string(),
    contributionAmount: z.number().nullable(),
    contributionDate: z.string(),
    shareBase: z.string(),
    sharePercent: percentText,
    adminFeePercent: percentText,
    adminFeeFixed: z.number().nullable(),
    payoutDay: z.string(),
    startDate: z.string().min(1, "Informe o início"),
    endDate: z.string(),
    notes: z.string().trim().max(4000),
  })
  .superRefine((c, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });
    if (c.endDate && c.startDate && c.endDate < c.startDate) {
      issue("endDate", "O fim vem antes do início");
    }
    if (c.type === "INVESTMENT") {
      if (!c.contributionType)
        issue("contributionType", "Escolha o tipo de aporte");
      if (c.contributionType === "CASH" && !c.contributionAmount) {
        issue("contributionAmount", "Informe o valor do aporte");
      }
      if (!c.shareBase) issue("shareBase", "Escolha a base");
      if (parsePercentInput(c.sharePercent) === null) {
        issue("sharePercent", "Informe o percentual");
      }
    } else if (
      parsePercentInput(c.adminFeePercent) === null &&
      c.adminFeeFixed === null
    ) {
      issue("adminFeePercent", "Informe a taxa (percentual, fixa ou as duas)");
    }
  });

export type ContractFormValues = z.infer<typeof contractFormSchema>;

/** Fields the API may report back by name (422 `fields`). */
export const CONTRACT_FORM_FIELDS = [
  "type",
  "contributionType",
  "contributionAmount",
  "contributionDate",
  "shareBase",
  "sharePercent",
  "adminFeePercent",
  "adminFeeFixed",
  "payoutDay",
  "startDate",
  "endDate",
  "notes",
] as const;

export function contractFormDefaults(
  contract?: PartnerContract,
): ContractFormValues {
  return {
    type: contract?.type ?? "INVESTMENT",
    // A new investment starts as the common case: vehicles, share of revenue.
    contributionType: contract ? (contract.contributionType ?? "") : "ASSETS",
    contributionAmount: contract?.contributionAmount ?? null,
    contributionDate: contract?.contributionDate ?? "",
    shareBase: contract ? (contract.shareBase ?? "") : "REVENUE",
    sharePercent: percentInputOf(contract?.sharePercent),
    adminFeePercent: percentInputOf(contract?.adminFeePercent),
    adminFeeFixed: contract?.adminFeeFixed ?? null,
    payoutDay: contract?.payoutDay ? String(contract.payoutDay) : NO_DAY,
    startDate: contract?.startDate ?? todayInBrasilia(),
    endDate: contract?.endDate ?? "",
    notes: contract?.notes ?? "",
  };
}

/** The whole body (the PATCH replaces the terms; the status is kept). */
export function toContractInput(
  values: ContractFormValues,
  contract?: PartnerContract,
): PartnerContractInput {
  const investment = values.type === "INVESTMENT";
  const cash = investment && values.contributionType === "CASH";
  return {
    type: values.type,
    ...(contract ? { status: contract.status } : {}),
    contributionType: investment
      ? ((values.contributionType || null) as PartnerContributionType | null)
      : null,
    contributionAmount: cash ? values.contributionAmount : null,
    contributionDate: cash ? values.contributionDate || null : null,
    shareBase: investment
      ? ((values.shareBase || null) as PartnerShareBase | null)
      : null,
    sharePercent: investment ? parsePercentInput(values.sharePercent) : null,
    adminFeePercent: investment
      ? null
      : parsePercentInput(values.adminFeePercent),
    adminFeeFixed: investment ? null : values.adminFeeFixed,
    payoutDay: values.payoutDay === NO_DAY ? null : Number(values.payoutDay),
    startDate: values.startDate,
    endDate: values.endDate || null,
    notes: values.notes || null,
  };
}
