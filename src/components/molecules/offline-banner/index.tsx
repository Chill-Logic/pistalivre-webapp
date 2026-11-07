import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/ui/useOnlineStatus";

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-warning px-4 py-2 text-sm text-warning-foreground"
    >
      <WifiOff className="size-4" aria-hidden />
      Você está offline. Os dados podem estar desatualizados.
    </div>
  );
}
