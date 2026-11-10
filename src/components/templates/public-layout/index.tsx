import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Main } from "@/components/atoms/landmarks";
import { Text } from "@/components/atoms/text";
import { Logo } from "@/components/molecules/logo";
import { OfflineBanner } from "@/components/molecules/offline-banner";

type PublicLayoutProps = {
  /** The company's name, under the emblem (blank while it loads). */
  companyName?: string;
  children: ReactNode;
};

/**
 * Public screens of the customer's domain (/quero-alugar, /questionario): no
 * login, no menu. The brand band of the login on top, then one narrow column,
 * mobile first: most people arrive from a link on the phone.
 */
export function PublicLayout({ companyName, children }: PublicLayoutProps) {
  return (
    <Box className="flex min-h-dvh flex-col bg-background">
      <OfflineBanner />
      <Box className="flex flex-col items-center gap-2 bg-gradient-to-br from-[#E4141B] via-[#8a0c11] to-[#1a0507] px-6 pb-6 pt-[calc(1.5rem+env(safe-area-inset-top))] text-white">
        <Logo size="lg" className="drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]" />
        <Text weight="medium" className="min-h-5 text-white/85">
          {companyName ?? ""}
        </Text>
      </Box>
      <Main className="flex flex-1 justify-center px-4 py-6 md:py-10">
        <Box className="w-full max-w-lg space-y-6">{children}</Box>
      </Main>
    </Box>
  );
}
