import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { queryClient } from "./query-client";
import { PwaUpdatePrompt } from "@/components/organisms/pwa-update-prompt";
import { QueryDevtools } from "@/components/organisms/query-devtools";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <PwaUpdatePrompt />
      <Toaster position="top-center" richColors closeButton />
      <QueryDevtools />
    </QueryClientProvider>
  );
}
