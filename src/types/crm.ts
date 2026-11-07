import type { DocumentFile } from "@/types/document";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFYING"
  | "DOCUMENTS"
  | "CONTRACT"
  | "WON"
  | "LOST";

export type LeadFunnel = {
  byStatus: Record<LeadStatus, number>;
  bySource: { source: string; total: number; won: number }[];
  lostReasons: { code: string; label: string; count: number }[];
};

export type LeadListItem = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: LeadStatus;
  /** Sandbox lead: out of every metric. */
  isTest: boolean;
  interest: string | null;
  /** utm source, or "direto". */
  source: string;
  campaign: string | null;
  campaignLabel: string | null;
  customerId: string | null;
  reopenedFromId: string | null;
  createdAt: string;
};

export type LostReason = { code: string; label: string };

export type Touch = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  referrer: string | null;
  landing: string | null;
  touchAt: string | null;
};

export type LeadActivity = {
  id: string;
  type: string;
  /** For STATUS_CHANGE: the new status code. */
  note: string | null;
  createdByName: string | null;
  createdAt: string;
  documents: DocumentFile[];
};

export type LeadChainLink = {
  id: string;
  name: string;
  status: LeadStatus;
  lostReasons: LostReason[];
  lostReason: string | null;
  reopenReason: string | null;
  createdAt: string;
  /** The lead being viewed. */
  current: boolean;
};

export type LeadDetail = LeadListItem & {
  desiredModelId: string | null;
  desiredVehicle: string | null;
  notes: string | null;
  lostReasons: LostReason[];
  lostReason: string | null;
  reopenReason: string | null;
  qualification: {
    workApps: string[];
    appsExperience: string | null;
    appsExperienceLabel: string | null;
    incomeType: string | null;
    incomeTypeLabel: string | null;
    wantsOwnVehicle: boolean | null;
    qualifiedAt: string | null;
  } | null;
  first: Touch;
  last: Touch;
  updatedAt: string;
  interestedPlan: {
    id: string;
    name: string;
    rate: number;
    ratePeriod: string;
    durationMonths: number | null;
  } | null;
  questionnaire: {
    step: string;
    submittedAt: string | null;
    expiresAt: string;
    expired: boolean;
    /** Only while the session is still open. */
    link: string | null;
  } | null;
  activities: LeadActivity[];
  proposals: {
    id: string;
    status: string;
    rejectionReason: string | null;
    document: DocumentFile | null;
    createdAt: string;
  }[];
  chain: LeadChainLink[];
};

export type LeadFilters = {
  page: number;
  pageSize: number;
  q: string;
  status: LeadStatus | "";
  /** "" = real leads only (API default) | "test" | "all". */
  test: "" | "test" | "all";
};
