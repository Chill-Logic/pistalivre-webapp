import { RefreshCw } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { useFinanceSync } from "@/hooks/api/gestao/finance/useFinanceSync";
import { cn } from "@/utils/cn";

/**
 * "Sincronizar do Asaas": brings back what a missed webhook (or a charge
 * created there but not recorded here) left out. It only reads from Asaas.
 */
export function FinanceSyncButton() {
  const sync = useFinanceSync();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={sync.isPending}
      onClick={() => sync.mutate()}
    >
      <RefreshCw
        className={cn(
          sync.isPending && "animate-spin motion-reduce:animate-none",
        )}
      />
      {sync.isPending ? "Sincronizando…" : "Sincronizar do Asaas"}
    </Button>
  );
}
