import type { PortalProfile, PortalRentalSections } from "@/types/portal";
import { maskPixKey, onlyDigits } from "@/utils/masks";
import { pluralize } from "@/utils/text";

/**
 * Where the rental is, in the renter's words (null = active, nothing to
 * say). Same three steps the old portal showed, from the API's flags.
 */
export function rentalStageNotice(sections: PortalRentalSections) {
  if (sections.closed) return "Locação encerrada: aqui fica só para consulta.";
  if (!sections.financialVisible) {
    return "Locação em preparação. Assim que a caução for liberada, suas notas fiscais aparecem aqui.";
  }
  if (!sections.operationalVisible) {
    return sections.status === "AWAITING_DELIVERY"
      ? "Caução confirmada: aguardando a entrega do veículo. Vistorias, manutenções e reembolsos ficam disponíveis quando a locação for ativada."
      : "Aguardando o pagamento da caução. Vistorias, manutenções e reembolsos ficam disponíveis quando a locação for ativada.";
  }
  return null;
}

/**
 * The renter's own CPF, e-mail or phone as the starting pix key of that
 * type (masked like typed); "" when there is nothing to offer.
 */
export function pixKeyPrefill(
  type: string,
  profile: Partial<PortalProfile> | undefined,
) {
  const raw =
    type === "CPF"
      ? profile?.document
      : type === "EMAIL"
        ? profile?.email
        : type === "PHONE"
          ? phoneWithoutCountry(profile?.phone)
          : null;
  return raw ? maskPixKey(type, raw) : "";
}

/** "+55 11 9…" → "11 9…" (the pix phone field takes DDD + number). */
function phoneWithoutCountry(phone: string | null | undefined) {
  if (!phone) return phone;
  const digits = onlyDigits(phone);
  return digits.length > 11 && digits.startsWith("55")
    ? digits.slice(2)
    : digits;
}

/** Home card title: what asks for payment. */
export function openChargesTitle(open: number) {
  return open > 0
    ? `${pluralize(open, "cobrança", "cobranças")} em aberto`
    : "Cobranças";
}

/** Home card title: a refused request asks for action (fix and ask again). */
export function reimbursementsTitle(rejected: number) {
  return rejected > 0
    ? pluralize(rejected, "pedido recusado", "pedidos recusados")
    : "Reembolsos";
}

/** The renter's own CPF, e-mail and phone, to start the pix key from. */
export function walletPrefill(
  profile: Partial<PortalProfile> | undefined,
  sessionEmail: string | undefined,
) {
  return {
    CPF: profile?.document,
    EMAIL: profile?.email ?? sessionEmail,
    PHONE: phoneWithoutCountry(profile?.phone),
  };
}

/**
 * A charge's meta line for the renter: the API writes the staff's channel
 * ("Fora do Asaas · LOC-…"), but the renter does not know what Asaas is, so
 * only the rental code stays.
 */
export function renterChargeMeta(meta: string | null | undefined) {
  if (!meta) return null;
  const parts = meta.split(" · ").filter((part) => !/asaas/i.test(part));
  return parts.join(" · ") || null;
}
