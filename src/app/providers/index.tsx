import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { queryClient } from "./query-client";
import { PwaUpdatePrompt } from "@/components/organisms/pwa-update-prompt";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <PwaUpdatePrompt />
      <Toaster position="top-center" richColors closeButton />
      {import.meta.env.DEV && (
        // Desktop only: on phones the floating button covers the bottom nav.
        <div className="hidden md:block">
          <ReactQueryDevtools buttonPosition="bottom-left" />
        </div>
      )}
    </QueryClientProvider>
  );
}
