import { RefreshCw } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { usePwaUpdate } from "@/hooks/ui/usePwaUpdate";

/** Asks before swapping to a new version, so nothing in progress is lost. */
export function PwaUpdatePrompt() {
  const { needRefresh, update, dismiss } = usePwaUpdate();
  if (!needRefresh) return null;

  return (
    <Box
      role="status"
      className="fixed inset-x-4 bottom-20 z-50 flex items-center gap-3 rounded-lg border bg-card p-4 shadow-lg md:bottom-6 md:left-auto md:right-6 md:w-96"
    >
      <RefreshCw className="size-5 shrink-0 text-primary" aria-hidden />
      <Text className="flex-1">Nova versão disponível.</Text>
      <Button size="sm" variant="ghost" onClick={dismiss}>
        Depois
      </Button>
      <Button size="sm" onClick={update}>
        Atualizar
      </Button>
    </Box>
  );
}
