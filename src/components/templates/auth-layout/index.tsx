import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Heading } from "@/components/atoms/heading";
import { Main } from "@/components/atoms/landmarks";
import { Text } from "@/components/atoms/text";
import { Logo } from "@/components/molecules/logo";
import { Credits } from "@/components/molecules/credits";
import { OfflineBanner } from "@/components/molecules/offline-banner";

type AuthLayoutProps = {
  /** Which area this login opens ("Gestão", "Área do cliente"). */
  area: string;
  title: string;
  children: ReactNode;
};

/**
 * Login screens. The brand panel is asphalt-dark with the emblem, edged by a
 * red-and-white kerb (the curb of a race track): the one motorsport detail,
 * echoing the emblem's checkers. A band on top on the phone, the left part on
 * the desktop; the form side stays quiet.
 */
export function AuthLayout({ area, title, children }: AuthLayoutProps) {
  return (
    <Box className="flex min-h-dvh flex-col bg-background">
      <OfflineBanner />
      <Box className="flex flex-1 flex-col md:flex-row">
        <Box className="relative flex flex-col items-center justify-center gap-3 overflow-hidden bg-[#141416] px-6 pb-10 pt-[calc(2.5rem+env(safe-area-inset-top))] text-white md:w-[40%] md:pb-16 md:pt-16">
          <Logo size="hero" />
          <Text weight="medium" className="text-white/70">
            {area}
          </Text>
          <Box
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1.5 bg-[repeating-linear-gradient(90deg,#E4141B_0_18px,#F4F4F5_18px_36px)] md:inset-x-auto md:inset-y-0 md:right-0 md:h-auto md:w-1.5 md:bg-[repeating-linear-gradient(180deg,#E4141B_0_18px,#F4F4F5_18px_36px)]"
          />
        </Box>
        <Main className="flex flex-1 items-start justify-center px-4 py-8 md:items-center md:px-10">
          <Box className="w-full max-w-sm space-y-6">
            <Heading>{title}</Heading>
            {children}
            <Credits className="pt-4" />
          </Box>
        </Main>
      </Box>
    </Box>
  );
}
