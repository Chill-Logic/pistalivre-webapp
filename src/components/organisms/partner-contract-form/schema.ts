import { z } from "zod";
import {
  PARTNER_COST_KEYS,
  PARTNER_DEFAULT_COSTS,
  PARTNER_REVENUE_DEFAULT_COSTS,
} from "@/constants/partner";
import type {
  PartnerContract,
  PartnerContractCosts,
  PartnerContractInput,
  PartnerContributionType,
  PartnerShareBase,
} from "@/types/partner";
import { todayInBrasilia } from "@/utils/date";
import { parsePercentInput, percentInputOf } from "@/utils/percent";

/** Radix select reserves "": the "no value" entry of the payout day/weekday. */
export const NO_DAY = "__none__";

const payer = z.enum(["COMPANY", "PARTNER", "RENTER"], {
  errorMap: () => ({ message: "Escolha quem paga" }),
});
/** Insurance, tracker and taxes: never the renter (the API refuses it). */
const companyOrPartner = z.enum(["COMPANY", "PARTNER"], {
  errorMap: () => ({ message: "Só a empresa ou o parceiro" }),
});

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
    payoutFrequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"], {
      errorMap: () => ({ message: "Escolha a recorrência do repasse" }),
    }),
    payoutDay: z.string(),
    payoutWeekday: z.string(),
    costs: z.object({
      maintenance: payer,
      insurance: companyOrPartner,
      tracker: companyOrPartner,
      taxes: companyOrPartner,
      fines: payer,
    }),
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
      if (isProfitShare(c.type, c.shareBase)) {
        for (const key of PARTNER_COST_KEYS) {
          if (c.costs[key] !== "PARTNER") continue;
          ctx.addIssue({
            code: "custom",
            path: ["costs", key],
            message: "No lucro, nenhuma despesa é do parceiro",
          });
        }
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
  "payoutFrequency",
  "payoutDay",
  "payoutWeekday",
  "costs.maintenance",
  "costs.insurance",
  "costs.tracker",
  "costs.taxes",
  "costs.fines",
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
    payoutFrequency: contract?.payoutFrequency ?? "MONTHLY",
    payoutDay: contract?.payoutDay ? String(contract.payoutDay) : NO_DAY,
    payoutWeekday:
      contract?.payoutWeekday != null ? String(contract.payoutWeekday) : NO_DAY,
    // A new one starts as investment on the revenue: the accountant's model.
    costs: (contract
      ? { ...PARTNER_DEFAULT_COSTS, ...contract.costs }
      : { ...PARTNER_REVENUE_DEFAULT_COSTS }) as ContractFormValues["costs"],
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
  const monthly = values.payoutFrequency === "MONTHLY";
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
    payoutFrequency: values.payoutFrequency,
    // Only the day that matches the frequency goes (the other is cleared).
    payoutDay:
      monthly && values.payoutDay !== NO_DAY ? Number(values.payoutDay) : null,
    payoutWeekday:
      !monthly && values.payoutWeekday !== NO_DAY
        ? Number(values.payoutWeekday)
        : null,
    costs: values.costs,
    startDate: values.startDate,
    endDate: values.endDate || null,
    notes: values.notes || null,
  };
}

/**
 * Investment on the PROFIT: the expenses come off before the split, so none
 * may be the partner's (the API refuses it with 422 `costs.*`).
 */
export function isProfitShare(type: string, shareBase: string) {
  return type === "INVESTMENT" && shareBase === "PROFIT";
}

/** The same expenses with the partner's ones moved to the company. */
export function costsWithoutPartner(costs: PartnerContractCosts) {
  return Object.fromEntries(
    PARTNER_COST_KEYS.map((key) => [
      key,
      costs[key] === "PARTNER" ? "COMPANY" : costs[key],
    ]),
  ) as ContractFormValues["costs"];
}

/**
 * The starting expenses of a NEW contract for its type and base, while the
 * person did not choose any: investment on the revenue = the accountant's
 * model; otherwise the API's default (all on the company, fines on the renter).
 */
export function defaultCostsFor(type: string, shareBase: string) {
  const costs =
    type === "INVESTMENT" && shareBase === "REVENUE"
      ? PARTNER_REVENUE_DEFAULT_COSTS
      : PARTNER_DEFAULT_COSTS;
  return { ...costs } as ContractFormValues["costs"];
}
