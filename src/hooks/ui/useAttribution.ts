import { useState } from "react";
import { campaignRef, currentTouch, firstTouch } from "@/helpers/attribution";
import type { LeadTouch } from "@/types/public-lead";

/**
 * Campaign attribution of this visit: last-touch from the address, first-touch
 * from the durable cookie (written on the first visit), and the link's `ref`.
 * Read once, when the screen opens.
 */
export function useAttribution(): { first: LeadTouch; last: LeadTouch; ref: string } {
  const [attribution] = useState(() => {
    const last = currentTouch();
    return { first: firstTouch(last), last, ref: campaignRef() };
  });
  return attribution;
}
