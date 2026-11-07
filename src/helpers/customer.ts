import type { CustomerAddress } from "@/types/customer";
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
