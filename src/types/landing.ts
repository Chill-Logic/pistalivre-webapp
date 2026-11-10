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
