import { RefreshCw } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { usePwaUpdate } from "@/hooks/ui/usePwaUpdate";

/** Asks before swapping to a new version, so nothing in progress is lost. */
export function PwaUpdatePrompt() {
  const { needRefresh, update, dismiss } = usePwaUpdate();
  if (!needRefresh) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-20 z-50 flex items-center gap-3 rounded-lg border bg-card p-4 shadow-lg md:bottom-6 md:left-auto md:right-6 md:w-96"
    >
      <RefreshCw className="size-5 shrink-0 text-primary" aria-hidden />
      <p className="flex-1 text-sm">Nova versão disponível.</p>
      <Button size="sm" variant="ghost" onClick={dismiss}>
        Depois
      </Button>
      <Button size="sm" onClick={update}>
        Atualizar
      </Button>
    </div>
  );
}
