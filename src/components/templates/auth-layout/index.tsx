import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Heading } from "@/components/atoms/heading";
import { Main } from "@/components/atoms/landmarks";
import { Text } from "@/components/atoms/text";
import { Logo } from "@/components/molecules/logo";
import { OfflineBanner } from "@/components/molecules/offline-banner";

type AuthLayoutProps = {
  /** Which area this login opens ("Gestão", "Área do cliente"). */
  area: string;
  title: string;
  children: ReactNode;
};

/**
 * Login screens. The brand panel (red to near-black and the emblem) is the
 * one loud thing: a band on top on the phone,
 * the left half on the desktop. The form side stays quiet.
 */
export function AuthLayout({ area, title, children }: AuthLayoutProps) {
  return (
    <Box className="flex min-h-dvh flex-col bg-background">
      <OfflineBanner />
      <Box className="flex flex-1 flex-col md:flex-row">
        <Box className="relative flex flex-col items-center justify-center gap-3 overflow-hidden bg-gradient-to-br from-[#E4141B] via-[#8a0c11] to-[#1a0507] px-6 pb-10 pt-[calc(2.5rem+env(safe-area-inset-top))] text-white md:w-[44%] md:pb-16 md:pt-16">
          <Logo
            size="hero"
            className="drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
          />
          <Text weight="medium" className="text-white/85">
            {area}
          </Text>
        </Box>
        <Main className="flex flex-1 items-start justify-center px-4 py-8 md:items-center md:px-10">
          <Box className="w-full max-w-sm space-y-6">
            <Heading>{title}</Heading>
            {children}
          </Box>
        </Main>
      </Box>
    </Box>
  );
}
