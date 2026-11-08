import type { BadgeVariantProps } from "@/components/atoms/badge/variants";
import type { BarItem } from "@/types/chart";
import type { LeadFunnel, LeadListItem, LeadStatus, Touch } from "@/types/crm";

type Variant = BadgeVariantProps["variant"];

const STATUS_VARIANT: Record<LeadStatus, Variant> = {
  NEW: "neutral",
  CONTACTED: "neutral",
  QUALIFYING: "warning",
  DOCUMENTS: "warning",
  CONTRACT: "warning",
  WON: "success",
  LOST: "outline",
};

export function leadStatusVariant(status: LeadStatus): Variant {
  return STATUS_VARIANT[status] ?? "neutral";
}

/** Funnel stages in order (the label catalog keeps the domain order). */
export const LEAD_STAGES: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFYING",
  "DOCUMENTS",
  "CONTRACT",
  "WON",
  "LOST",
];

/** "3 de 10 efetivados" per source, biggest first. */
export function sourceItems(funnel: LeadFunnel): BarItem[] {
  return [...funnel.bySource]
    .sort((a, b) => b.total - a.total)
    .map((source) => ({
      key: source.source,
      label: sourceLabel(source.source),
      value: source.total,
      display: `${source.won} de ${source.total} efetivados`,
    }));
}

export function lostReasonItems(funnel: LeadFunnel): BarItem[] {
  return funnel.lostReasons.map((reason) => ({
    key: reason.code,
    label: reason.label,
    value: reason.count,
    display: String(reason.count),
  }));
}

/** "google / cpc · campanha-x" — what brought the lead in. */
export function touchLabel(touch: Touch) {
  const channel = [touch.utmSource, touch.utmMedium]
    .filter(Boolean)
    .join(" / ");
  const parts = [channel || null, touch.utmCampaign].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "Direto";
}

/** The API says "direto" when there is no utm; show it as a label. */
export function sourceLabel(source: string) {
  return source === "direto" ? "Direto" : source;
}

/** A touch with anything recorded (otherwise it was a direct visit). */
export function hasTouchData(touch: Touch) {
  return Boolean(
    touch.utmSource || touch.utmCampaign || touch.referrer || touch.landing,
  );
}

/** "google / cpc" (source / medium) of one touch. */
export function touchChannel(touch: Touch) {
  return [touch.utmSource, touch.utmMedium].filter(Boolean).join(" / ") || "—";
}

/** List origin, as the management table: "instagram · black-friday". */
export function leadOriginLabel(lead: LeadListItem) {
  return [sourceLabel(lead.source), lead.campaign].filter(Boolean).join(" · ");
}
