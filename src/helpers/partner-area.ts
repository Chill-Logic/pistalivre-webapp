import { LABEL_MAPS, type LabelMapName } from "@/constants/label-maps";
import type { PartnerAreaContract } from "@/types/partner-area";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

type LabelFn = (map: LabelMapName, code: string) => string;

const percent = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

/** 40 → "40%" (the number comes from the contract; no math here). */
export function formatPercent(value: number) {
  return `${percent.format(value)}%`;
}

/** "Desde 15/10/2026" or "15/10/2026 a 01/11/2026". */
export function periodText(from: string, to: string | null) {
  return to
    ? `${formatCalendarDate(from)} a ${formatCalendarDate(to)}`
    : `Desde ${formatCalendarDate(from)}`;
}

/** "No contrato desde 15/10/2026" / "No contrato de 15/10/2026 a 01/11/2026". */
export function inContractText(joinedAt: string, leftAt: string | null) {
  return leftAt
    ? `No contrato de ${formatCalendarDate(joinedAt)} a ${formatCalendarDate(leftAt)}`
    : `No contrato desde ${formatCalendarDate(joinedAt)}`;
}

/** The part of a rental the partner sees: "15/10/2026 até hoje". */
export function visiblePeriodText(from: string, to: string | null) {
  return to
    ? `${formatCalendarDate(from)} a ${formatCalendarDate(to)}`
    : `${formatCalendarDate(from)} até hoje`;
}

/** A rent cycle: "09/11/2026 a 15/11/2026", or the day for a daily rent. */
export function cycleRangeText(start: string, end: string) {
  return start === end
    ? formatCalendarDate(start)
    : `${formatCalendarDate(start)} a ${formatCalendarDate(end)}`;
}

/** "Troca de fluidos, Pneus" (MAINTENANCE_SERVICE_LABELS). */
export function servicesText(services: string[], label: LabelFn) {
  return services
    .map((code) => label(LABEL_MAPS.maintenanceService, code))
    .join(", ");
}

/**
 * The contract's terms, as label/value pairs: investment = contribution and
 * the partner's share; management = the company's fee. Only what was filled.
 */
export function contractTerms(contract: PartnerAreaContract, label: LabelFn) {
  const terms: { label: string; value: string }[] = [];
  if (contract.type === "INVESTMENT") {
    if (contract.contributionType) {
      const parts = [
        label(LABEL_MAPS.partnerContributionType, contract.contributionType),
      ];
      if (contract.contributionAmount !== null)
        parts.push(formatCurrency(contract.contributionAmount));
      if (contract.contributionDate)
        parts.push(`em ${formatCalendarDate(contract.contributionDate)}`);
      terms.push({ label: "Aporte", value: parts.join(" · ") });
    }
    if (contract.sharePercent !== null) {
      const base = contract.shareBase
        ? ` do ${label(LABEL_MAPS.partnerShareBase, contract.shareBase).toLowerCase()}`
        : "";
      terms.push({
        label: "Sua participação",
        value: `${formatPercent(contract.sharePercent)}${base}`,
      });
    }
  } else {
    const fee = [
      contract.adminFeePercent !== null
        ? formatPercent(contract.adminFeePercent)
        : null,
      contract.adminFeeFixed !== null
        ? formatCurrency(contract.adminFeeFixed)
        : null,
    ].filter(Boolean);
    if (fee.length)
      terms.push({ label: "Taxa da locadora", value: fee.join(" + ") });
  }
  if (contract.payoutDay !== null)
    terms.push({ label: "Repasse", value: `Todo dia ${contract.payoutDay}` });
  return terms;
}
