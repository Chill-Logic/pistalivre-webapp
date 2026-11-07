import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { queryClient } from "./query-client";
import { SidebarProvider } from "./sidebar-provider";
import { TooltipProvider } from "@/components/atoms/tooltip";
import { PwaUpdatePrompt } from "@/components/organisms/pwa-update-prompt";
import { QueryDevtools } from "@/components/organisms/query-devtools";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        <SidebarProvider>{children}</SidebarProvider>
      </TooltipProvider>
      <PwaUpdatePrompt />
      <Toaster position="top-center" richColors closeButton />
      <QueryDevtools />
    </QueryClientProvider>
  );
}
