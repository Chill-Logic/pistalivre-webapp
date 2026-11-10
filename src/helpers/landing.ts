import type { Data } from "@puckeditor/core";
import { LEGACY_LANDING_DRAFT_KEY } from "@/constants/landing";
import { safeStorage } from "@/helpers/safe-storage";

/** The draft the POC kept in this browser (used once, when the server has none). */
export function readLegacyLandingDraft(): Data | null {
  const stored = safeStorage.get(LEGACY_LANDING_DRAFT_KEY);
  if (!stored) return null;
  try {
    const data = JSON.parse(stored) as Data;
    return Array.isArray(data?.content) ? data : null;
  } catch {
    return null;
  }
}

export function forgetLegacyLandingDraft() {
  safeStorage.remove(LEGACY_LANDING_DRAFT_KEY);
}

/** The page's title and description, from the root props (tab, search, sharing). */
export function landingMeta(data: Data | null | undefined) {
  const props = (data?.root?.props ?? {}) as { title?: string; description?: string };
  return {
    title: props.title?.trim() || "Pista Livre",
    description:
      props.description?.trim() ||
      "Aluguel de motos e veículos para quem trabalha com aplicativo.",
  };
}
