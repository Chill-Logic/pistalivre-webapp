import type { BadgeVariantProps } from "@/components/atoms/badge/variants";
import type {
  PartnerAreaCycleState,
  PartnerAreaPaymentKind,
  PartnerAreaTodayState,
} from "@/types/partner-area";

type Variant = BadgeVariantProps["variant"];

/** The API requires at least this for the partner's password. */
export const PARTNER_PASSWORD_MIN_LENGTH = 8;

/** `?senha=alterada` on the login: the session ended after the change. */
export const PARTNER_PASSWORD_CHANGED = { param: "senha", value: "alterada" };

/** Today's cycle of the rent, as the server tells it. */
export const PARTNER_TODAY_STATE: Record<
  PartnerAreaTodayState,
  { label: string; variant: Variant }
> = {
  PAID: { label: "Pago", variant: "success" },
  PARTIAL: { label: "Pago em parte", variant: "warning" },
  OPEN: { label: "Em aberto", variant: "error" },
  UPCOMING: { label: "Ainda não venceu", variant: "neutral" },
  WAIVED: { label: "Abonado", variant: "neutral" },
  NONE: { label: "Sem cobrança hoje", variant: "outline" },
};

/** Same words and colors as the rent statement (constants/rent-statement). */
export const PARTNER_CYCLE_STATE: Record<
  PartnerAreaCycleState,
  { label: string; variant: Variant }
> = {
  PAID: { label: "Pago", variant: "success" },
  PARTIAL: { label: "Pago em parte", variant: "warning" },
  OPEN: { label: "Falta pagar", variant: "error" },
  UPCOMING: { label: "Ainda não venceu", variant: "neutral" },
  WAIVED: { label: "Abonado", variant: "neutral" },
};

export const PARTNER_PAYMENT_KIND: Record<PartnerAreaPaymentKind, string> = {
  payment: "Pagamento",
  credit: "Desconto da locadora",
};
