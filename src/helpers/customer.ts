import type {
  AsaasDirectory,
  CustomerAddress,
  CustomerAsaasPresence,
  CustomerListItem,
} from "@/types/customer";
import { calendarDay, todayInBrasilia } from "@/utils/date";
import { formatZip } from "@/utils/document";

/** CNH validity is a calendar date; expired = before today in Brasília. */
export function isLicenseExpired(validUntil: string | null) {
  return validUntil !== null && calendarDay(validUntil) < todayInBrasilia();
}

/** "Rua X, 10 – apto 2" / "Centro – Rio de Janeiro/RJ" / "20000-000" */
export function addressLines(address: CustomerAddress) {
  const street = [address.line, address.number].filter(Boolean).join(", ");
  const firstLine = [street, address.complement].filter(Boolean).join(" – ");
  const cityState = [address.city, address.state].filter(Boolean).join("/");
  const secondLine = [address.neighborhood, cityState]
    .filter(Boolean)
    .join(" – ");
  return [firstLine, secondLine, address.zip && formatZip(address.zip)].filter(
    (line): line is string => Boolean(line),
  );
}

export function hasEmergencyContact(contact: {
  name: string | null;
  phone: string | null;
}) {
  return Boolean(contact.name || contact.phone);
}

/**
 * Linked × same CPF on both sides ("Em ambos", with the Asaas id to link to)
 * × not linked. Without the directory (loading or Asaas down), only what the
 * list itself knows.
 */
export function customerAsaasPresence(
  customer: Pick<CustomerListItem, "id" | "document" | "asaasLinked">,
  directory: AsaasDirectory | undefined,
): CustomerAsaasPresence {
  if (customer.asaasLinked) return { state: "linked", linkTo: null };
  const match = directory?.reconcilable.find(
    (item) => item.customerId === customer.id,
  );
  const digits = customer.document.replace(/\D/g, "");
  const inBoth =
    Boolean(match) || Boolean(directory?.inBothDocuments.includes(digits));
  return {
    state: inBoth ? "both" : "unlinked",
    linkTo: match?.asaasCustomerId ?? null,
  };
}
