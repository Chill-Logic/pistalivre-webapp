import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import type { LandingBackground, LandingSpacing, LandingWidth } from "@/types/landing";
import { cn } from "@/utils/cn";

const BACKGROUND: Record<LandingBackground, string> = {
  white: "bg-background",
  muted: "bg-muted/60",
  brandSoft: "bg-[#E4141B]/[0.06]",
  brand: "bg-gradient-to-br from-[#E4141B] via-[#8a0c11] to-[#1a0507]",
  dark: "bg-[#131316]",
  image: "bg-[#131316] bg-cover bg-center",
};

/** Brand, dark and image backgrounds switch the section to the dark palette. */
const DARK: LandingBackground[] = ["brand", "dark", "image"];

const SPACING: Record<LandingSpacing, string> = {
  sm: "py-8 md:py-10",
  md: "py-12 md:py-16",
  lg: "py-16 md:py-24",
};

const WIDTH: Record<LandingWidth, string> = {
  narrow: "max-w-3xl",
  normal: "max-w-6xl",
  full: "max-w-none",
};

type LandingSectionShellProps = {
  background?: LandingBackground;
  spacing?: LandingSpacing;
  width?: LandingWidth;
  /** Picture behind the section (background "image"), darkened for the text. */
  imageUrl?: string;
  /** Anchor for links to this band (#quero-alugar). */
  id?: string;
  className?: string;
  children: ReactNode;
};

/**
 * One band of the landing: background, vertical spacing and content width,
 * all from fixed options (the brand stays consistent whoever edits). On dark
 * backgrounds the theme's dark palette takes over, so text and cards adapt.
 */
export function LandingSectionShell({
  background = "white",
  spacing = "md",
  width = "normal",
  imageUrl,
  id,
  className,
  children,
}: LandingSectionShellProps) {
  const dark = DARK.includes(background);
  const withImage = background === "image" && imageUrl?.startsWith("https://");
  return (
    <Box
      id={id}
      className={cn("relative scroll-mt-4 px-4 md:px-10", BACKGROUND[background], SPACING[spacing], dark && "dark text-foreground")}
      style={withImage ? { backgroundImage: `url(${JSON.stringify(imageUrl)})` } : undefined}
    >
      {withImage && <Box aria-hidden="true" className="absolute inset-0 bg-black/60" />}
      <Box className={cn("relative mx-auto", WIDTH[width], className)}>{children}</Box>
    </Box>
  );
}
