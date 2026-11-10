import type { Data } from "@puckeditor/core";
import { useState } from "react";
import { LANDING_INITIAL_DATA } from "@/components/organisms/landing-editor/config";
import { LANDING_DRAFT_KEY } from "@/constants/landing";
import { safeStorage } from "@/helpers/safe-storage";

function readDraft(): Data {
  const stored = safeStorage.get(LANDING_DRAFT_KEY);
  if (!stored) return LANDING_INITIAL_DATA;
  try {
    return JSON.parse(stored) as Data;
  } catch {
    return LANDING_INITIAL_DATA;
  }
}

/** The landing's draft, kept in this browser (the POC has no backend yet). */
export function useLandingDraft() {
  const [draft, setDraft] = useState<Data>(readDraft);
  const save = (data: Data) => {
    safeStorage.set(LANDING_DRAFT_KEY, JSON.stringify(data));
    setDraft(data);
  };
  const reset = () => {
    safeStorage.remove(LANDING_DRAFT_KEY);
    setDraft(LANDING_INITIAL_DATA);
  };
  return { draft, save, reset };
}
