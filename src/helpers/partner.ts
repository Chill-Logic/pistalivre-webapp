import { LABEL_MAPS, type LabelMapName } from "@/constants/label-maps";
import {
  PARTNER_COST_KEYS,
  PARTNER_DEFAULT_COSTS,
  PARTNER_PROPOSAL_STATUS_LABELS,
  WEEKDAY_PLURAL,
} from "@/constants/partner";
import { ratePeriodSuffix } from "@/helpers/billing";
import type {
  Partner,
  PartnerContract,
  PartnerContractCosts,
  PartnerContractInput,
  PartnerContractStatus,
  PartnerContractVehicle,
  PartnerOfferRatePeriod,
  PartnerPayoutFrequency,
  PartnerProposalVersion,
} from "@/types/partner";
import { formatCnpj, formatCpf } from "@/utils/document";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { formatPercent } from "@/utils/percent";
import { formatPlate } from "@/utils/plate";

/** "CPF 529.982.247-25" / "CNPJ 12.345.678/0001-95". */
export function partnerDocument(
  partner: Pick<Partner, "documentType" | "document">,
) {
  const formatted =
    partner.documentType === "CPF"
      ? formatCpf(partner.document)
      : formatCnpj(partner.document);
  return `${partner.documentType} ${formatted}`;
}

/** "ABC-1234 · Honda CG 160 2024", with what the API knows of the vehicle. */
export function partnerVehicleName(vehicle: PartnerContractVehicle) {
  const plate = vehicle.plate ? formatPlate(vehicle.plate) : "Veículo removido";
  return vehicle.label ? `${plate} · ${vehicle.label}` : plate;
}

/** Vehicles still in the contract (no exit day). */
export function currentVehicles(contract: PartnerContract) {
  return contract.vehicles.filter((vehicle) => !vehicle.leftAt);
}

/**
 * The deal in one line, only restating what was saved (no math):
 * "40% do faturamento" / "Taxa de 15% + R$ 100,00".
 */
export function contractTerms(
  contract: PartnerContract,
  shareBaseLabel: (code: string) => string,
) {
  if (contract.type === "INVESTMENT") {
    if (contract.sharePercent === null) return "Participação não informada";
    const base = contract.shareBase
      ? ` do ${shareBaseLabel(contract.shareBase).toLowerCase()}`
      : "";
    return `${formatPercent(contract.sharePercent)}${base} para o parceiro`;
  }
  if (contract.payoutMode === "FIXED") {
    return `Repasse de até ${formatCurrency(contract.fixedPayout ?? 0)} por moto/mês${maintenanceRuleSuffix(contract)}`;
  }
  const fee = [
    contract.adminFeePercent !== null &&
      formatPercent(contract.adminFeePercent),
    contract.adminFeeFixed !== null && formatCurrency(contract.adminFeeFixed),
  ].filter(Boolean);
  return fee.length
    ? `Taxa de ${fee.join(" + ")} para a empresa`
    : "Taxa não informada";
}

/**
 * The contract as a PATCH body: the API replaces the terms (and a missing
 * status means DRAFT), so a situation change resends everything as it is.
 */
/** ", menos 10% da manutenção do mês" / ", menos a manutenção do mês + 10%" (fixed payout). */
export function maintenanceRuleSuffix(contract: {
  maintenanceFeePercent?: number | null;
  maintenanceMode?: string | null;
}) {
  const pct = contract.maintenanceFeePercent ?? 0;
  if (contract.maintenanceMode === "COST_PLUS_FEE") {
    return `, menos a manutenção do mês + ${formatPercent(pct)}`;
  }
  return pct ? `, menos ${formatPercent(pct)} da manutenção do mês` : "";
}

export function contractInputOf(
  contract: PartnerContract,
  changes: Partial<PartnerContractInput> = {},
): PartnerContractInput {
  return {
    type: contract.type,
    status: contract.status,
    contributionType: contract.contributionType,
    contributionAmount: contract.contributionAmount,
    contributionDate: contract.contributionDate,
    shareBase: contract.shareBase,
    sharePercent: contract.sharePercent,
    adminFeePercent: contract.adminFeePercent,
    adminFeeFixed: contract.adminFeeFixed,
    payoutMode: contract.payoutMode,
    fixedPayout: contract.fixedPayout,
    maintenanceFeePercent: contract.maintenanceFeePercent,
    maintenanceMode: contract.maintenanceMode ?? null,
    payoutFrequency: contract.payoutFrequency,
    payoutDay: contract.payoutDay,
    payoutWeekday: contract.payoutWeekday,
    costs: contract.costs,
    startDate: contract.startDate,
    endDate: contract.endDate,
    notes: contract.notes,
    ...changes,
  };
}

type LabelFn = (map: LabelMapName, code: string | number) => string;

type Payout = {
  payoutFrequency: PartnerPayoutFrequency;
  payoutDay: number | null;
  payoutWeekday: number | null;
};

/**
 * When the partner is paid (outside the system): "Mensal, todo dia 10",
 * "Semanal, às sextas", "Quinzenal, às segundas" — or just the frequency
 * when the day was not set.
 */
export function payoutText(contract: Payout, label: LabelFn) {
  const frequency = label(
    LABEL_MAPS.partnerPayoutFrequency,
    contract.payoutFrequency ?? "MONTHLY",
  );
  if (contract.payoutFrequency === "MONTHLY" || !contract.payoutFrequency) {
    return contract.payoutDay
      ? `${frequency}, todo dia ${contract.payoutDay}`
      : frequency;
  }
  const weekday =
    contract.payoutWeekday !== null
      ? WEEKDAY_PLURAL[contract.payoutWeekday]
      : undefined;
  return weekday ? `${frequency}, ${weekday}` : frequency;
}

/** "R$ 480,00 / semana" — the rent the company intends to offer. */
export function offerRateText(
  rate: number | null,
  period: PartnerOfferRatePeriod | null,
) {
  if (rate === null) return null;
  const money = formatCurrency(rate);
  return period ? `${money} / ${ratePeriodSuffix(period)}` : money;
}

/** Who pays each expense, in the contract's order (label and payer). */
export function costPayerRows(
  costs: PartnerContractCosts | null | undefined,
  label: LabelFn,
) {
  const all = { ...PARTNER_DEFAULT_COSTS, ...costs };
  return PARTNER_COST_KEYS.map((key) => ({
    key,
    label: label(LABEL_MAPS.partnerCost, key),
    payer: label(LABEL_MAPS.partnerCostPayer, all[key]),
  }));
}

/** Badge colour of a contract's situation. */
export function contractStatusVariant(status: PartnerContractStatus) {
  if (status === "ACTIVE") return "success" as const;
  if (status === "DRAFT") return "warning" as const;
  return "outline" as const;
}

/**
 * When a version stopped waiting: "aceita em 09/11/2026 14:02" (null while
 * pending, or when the server did not record the moment).
 */
export function proposalDecisionText(
  version: Pick<PartnerProposalVersion, "status" | "decidedAt">,
) {
  if (version.status === "PROPOSED" || !version.decidedAt) return null;
  const label = PARTNER_PROPOSAL_STATUS_LABELS[version.status].toLowerCase();
  return `${label} em ${formatDateTime(version.decidedAt)}`;
}
