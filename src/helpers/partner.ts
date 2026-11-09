import type {
  Partner,
  PartnerContract,
  PartnerContractInput,
  PartnerContractStatus,
  PartnerContractVehicle,
} from "@/types/partner";
import { formatCnpj, formatCpf } from "@/utils/document";
import { formatCurrency } from "@/utils/format";
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

/** "ABC-1234 · Honda CG 160 2024", with what the API knows of the moto. */
export function partnerVehicleName(vehicle: PartnerContractVehicle) {
  const plate = vehicle.plate ? formatPlate(vehicle.plate) : "Moto removida";
  return vehicle.label ? `${plate} · ${vehicle.label}` : plate;
}

/** Motos still in the contract (no exit day). */
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
  const fee = [
    contract.adminFeePercent !== null && formatPercent(contract.adminFeePercent),
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
    payoutDay: contract.payoutDay,
    startDate: contract.startDate,
    endDate: contract.endDate,
    notes: contract.notes,
    ...changes,
  };
}

/** Badge colour of a contract's situation. */
export function contractStatusVariant(status: PartnerContractStatus) {
  if (status === "ACTIVE") return "success" as const;
  if (status === "DRAFT") return "warning" as const;
  return "outline" as const;
}
