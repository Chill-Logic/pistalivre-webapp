import { LABEL_MAPS, type LabelMapName } from "@/constants/label-maps";
import type {
  PartnerAreaContract,
  PartnerAreaRentalRow,
  PartnerAreaVehicleDetail,
  PartnerAreaVehicleRow,
} from "@/types/partner-area";
import { payoutText } from "@/helpers/partner";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

type LabelFn = (map: LabelMapName, code: string | number) => string;

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
  terms.push({ label: "Repasse", value: payoutText(contract, label) });
  return terms;
}

/**
 * Every vehicle of the partner's contracts, once each (a vehicle that
 * moved between contracts shows the one it is in now, or the latest).
 */
export function partnerVehicleRows(contracts: PartnerAreaContract[]) {
  const rows = new Map<string, PartnerAreaVehicleRow>();
  for (const contract of contracts) {
    for (const vehicle of contract.vehicles) {
      const current = rows.get(vehicle.vehicleId);
      const replaces =
        !current ||
        (current.leftAt !== null &&
          (vehicle.leftAt === null || vehicle.joinedAt > current.joinedAt));
      if (replaces)
        rows.set(vehicle.vehicleId, {
          ...vehicle,
          contractId: contract.id,
          contractCode: contract.code,
        });
    }
  }
  return [...rows.values()];
}

/** Counts for the home's indicators (no money: just how many). */
export function partnerHomeCounts(contracts: PartnerAreaContract[]) {
  const active = contracts.filter((contract) => contract.status === "ACTIVE");
  const inContract = new Set<string>();
  const rented = new Set<string>();
  for (const contract of active) {
    for (const vehicle of contract.vehicles) {
      if (vehicle.leftAt !== null) continue;
      inContract.add(vehicle.vehicleId);
      if (vehicle.currentRental) rented.add(vehicle.vehicleId);
    }
  }
  return {
    activeContracts: active.length,
    vehiclesInContract: inContract.size,
    vehiclesRented: rented.size,
  };
}

/** The rentals of every vehicle, newest first (Locações page). */
export function partnerRentalRows(details: PartnerAreaVehicleDetail[]) {
  const rows = new Map<string, PartnerAreaRentalRow>();
  for (const { vehicle, rentals } of details) {
    for (const rental of rentals) {
      rows.set(rental.id, {
        ...rental,
        vehicleLabel: vehicle.label,
        plate: vehicle.plate,
      });
    }
  }
  return [...rows.values()].sort((a, b) =>
    b.visibleFrom.localeCompare(a.visibleFrom),
  );
}
