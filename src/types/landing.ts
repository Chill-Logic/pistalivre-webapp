import type { Data } from "@puckeditor/core";

/** Background of a landing section (fixed options: the brand stays consistent). */
export type LandingBackground = "white" | "muted" | "brandSoft" | "brand" | "dark" | "image";
export type LandingSpacing = "sm" | "md" | "lg";
export type LandingWidth = "narrow" | "normal" | "full";

/** The style every section-like block shares. */
export type LandingSectionStyle = {
  background?: LandingBackground;
  spacing?: LandingSpacing;
  backgroundImage?: string;
};

/** The landing as Puck stores it (`root.props` = title and description). */
export type LandingData = Data;

type Person = { id: string; name: string } | null;

/** The landing as the staff sees it: the draft, the published one and who did what. */
export type LandingPageState = {
  draft: Data | null;
  published: Data | null;
  draftUpdatedAt: string | null;
  draftUpdatedBy: Person;
  publishedAt: string | null;
  publishedBy: Person;
  hasUnpublishedChanges: boolean;
};

export type LandingVersion = { id: string; publishedAt: string; publishedBy: Person };

/** The published landing, for the public site. */
export type PublicLanding = {
  data: Data | null;
  publishedAt: string | null;
  company: { name: string; whatsapp: string | null };
};

export type PublicCatalogItem = {
  id: string;
  brandName: string;
  modelName: string;
  year: number;
  description: string | null;
  coverSrc: string | null;
  variants: { id: string; color: string; swatch: string | null; isDefault: boolean; imageSrc: string | null }[];
  units: number;
  available: number;
};

export type PublicPlan = {
  id: string;
  name: string;
  description: string | null;
  rate: number;
  ratePeriod: string;
  durationMonths: number | null;
  renewable: boolean;
  noFidelity: boolean;
  ownershipAtEnd: boolean;
  highlights: string[];
  price: string;
  terms: string;
};
