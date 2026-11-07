import type { ReactNode } from "react";
import { Logo } from "@/components/atoms/logo";
import { OfflineBanner } from "@/components/molecules/offline-banner";

type AuthLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

/** Bare page for login flows: full-width on mobile, centered card on larger screens. */
export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <OfflineBanner />
      <div className="flex flex-1 flex-col justify-center px-4 py-10 sm:items-center">
        <div className="w-full space-y-6 sm:max-w-sm sm:rounded-lg sm:border sm:bg-card sm:p-8 sm:shadow-sm">
          <Logo />
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
