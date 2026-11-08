import { Image } from "@/components/atoms/image";
import { cn } from "@/utils/cn";

const SIZE = {
  /** Collapsed sidebar. */
  sm: "h-8",
  /** Headers (h-14 bars). */
  md: "h-10",
  /** Open sidebar, where there is room. */
  xl: "h-12",
  /** Login screens. */
  lg: "h-24",
  /** The brand panel of the login (big on the desktop). */
  hero: "h-28 md:h-48 lg:h-56",
} as const;

type LogoProps = {
  size?: keyof typeof SIZE;
  className?: string;
};

/**
 * The Pista Livre emblem (it carries the name, so no text beside it).
 * Source: `pista-livre/public/logo.png`, cropped; the PWA icons come from
 * `brand/logo-icon.png` (`npm run pwa:assets`).
 */
export function Logo({ size = "md", className }: LogoProps) {
  return (
    <Image
      src="/logo.webp"
      alt="Pista Livre"
      width={460}
      height={320}
      className={cn("w-auto shrink-0 select-none", SIZE[size], className)}
      draggable={false}
    />
  );
}
