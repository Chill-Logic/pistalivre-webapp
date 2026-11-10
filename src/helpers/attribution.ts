import type { LeadTouch } from "@/types/public-lead";

/** Durable first-touch cookie (the same name the old Next landing wrote). */
const FIRST_TOUCH_COOKIE = "pl_ft";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export const EMPTY_TOUCH: LeadTouch = {
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  utmTerm: "",
  utmContent: "",
  referrer: "",
  landing: "",
  touchAt: "",
};

function readCookie(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

/** This visit, from the address: last-touch. */
export function currentTouch(): LeadTouch {
  const url = new URL(window.location.href);
  const query = (key: string) => url.searchParams.get(key) ?? "";
  return {
    utmSource: query("utm_source"),
    utmMedium: query("utm_medium"),
    utmCampaign: query("utm_campaign"),
    utmTerm: query("utm_term"),
    utmContent: query("utm_content"),
    referrer: document.referrer || "",
    landing: url.pathname + url.search,
    touchAt: new Date().toISOString(),
  };
}

/**
 * First-touch: the very first visit, kept in a cookie for a year (so it lives
 * in the browser, not on the server). The first call writes it.
 */
export function firstTouch(current: LeadTouch): LeadTouch {
  const stored = readCookie(FIRST_TOUCH_COOKIE);
  if (stored) {
    try {
      return { ...EMPTY_TOUCH, ...(JSON.parse(stored) as Partial<LeadTouch>) };
    } catch {
      return current;
    }
  }
  try {
    document.cookie = `${FIRST_TOUCH_COOKIE}=${encodeURIComponent(
      JSON.stringify(current),
    )}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
  } catch {
    /* cookies blocked: the lead still goes, with this visit as first-touch */
  }
  return current;
}

/** The campaign link's code (`/l/<code>` adds `?ref=`). */
export function campaignRef(): string {
  return new URL(window.location.href).searchParams.get("ref") ?? "";
}
