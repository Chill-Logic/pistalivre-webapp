import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { usePwaUpdate } from "@/hooks/ui/usePwaUpdate";

/** Asks before swapping to a new version, so nothing in progress is lost. */
export function PwaUpdatePrompt() {
  const { needRefresh, update, dismiss } = usePwaUpdate();
  // The swap takes a moment (the page reloads at the end): show it's on.
  const [updating, setUpdating] = useState(false);
  if (!needRefresh) return null;

  return (
    <Box
      role="status"
      className="fixed inset-x-4 bottom-20 z-50 flex items-center gap-3 rounded-lg border bg-card p-4 shadow-lg md:bottom-6 md:left-auto md:right-6 md:w-96"
    >
      <RefreshCw className="size-5 shrink-0 text-primary" aria-hidden />
      <Text className="flex-1">Nova versão disponível.</Text>
      <Button size="sm" variant="ghost" onClick={dismiss} disabled={updating}>
        Depois
      </Button>
      <Button
        size="sm"
        disabled={updating}
        onClick={() => {
          setUpdating(true);
          void update();
        }}
      >
        {updating && <Spinner className="text-primary-foreground" />}
        {updating ? "Atualizando…" : "Atualizar"}
      </Button>
    </Box>
  );
}
