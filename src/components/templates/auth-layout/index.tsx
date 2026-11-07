import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Heading } from "@/components/atoms/heading";
import { Main } from "@/components/atoms/landmarks";
import { Logo } from "@/components/molecules/logo";
import { OfflineBanner } from "@/components/molecules/offline-banner";

type AuthLayoutProps = {
  title: string;
  children: ReactNode;
};

/** Bare page for login flows: full-width on mobile, centered card on larger screens. */
export function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <Box className="flex min-h-dvh flex-col">
      <OfflineBanner />
      <Main className="flex flex-1 flex-col justify-center px-4 py-10 sm:items-center">
        <Box className="w-full space-y-6 sm:max-w-sm sm:rounded-lg sm:border sm:bg-card sm:p-8 sm:shadow-sm">
          <Logo />
          <Heading>{title}</Heading>
          {children}
        </Box>
      </Main>
    </Box>
  );
}
