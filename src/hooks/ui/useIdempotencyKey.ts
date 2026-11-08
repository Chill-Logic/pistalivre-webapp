import { useState } from "react";

function newKey() {
  return crypto.randomUUID();
}

/**
 * One Idempotency-Key per form session: a double click or a retry after a
 * network failure reuses it, so the server never issues twice. The server
 * keeps only successes (and NOT_RECORDED), so correcting a 422/502 and
 * sending again with the same key works. `renew()` after a success.
 */
export function useIdempotencyKey() {
  const [key, setKey] = useState(newKey);
  return { key, renew: () => setKey(newKey()) } as const;
}
