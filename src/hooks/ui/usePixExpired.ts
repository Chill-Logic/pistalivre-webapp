import { useEffect, useState } from "react";
import { isPixExpired } from "@/helpers/charge";

const CHECK_EVERY_MS = 30_000;

/**
 * Whether a pix QR is past its expiration, rechecked while the screen stays
 * open (a QR can lapse with the page in front of the renter).
 */
export function usePixExpired(expirationDate: string | null | undefined) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!expirationDate) return;
    const timer = setInterval(() => setNow(new Date()), CHECK_EVERY_MS);
    return () => clearInterval(timer);
  }, [expirationDate]);

  return expirationDate ? isPixExpired(expirationDate, now) : false;
}
