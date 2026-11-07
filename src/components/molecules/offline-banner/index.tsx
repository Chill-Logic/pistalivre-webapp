import { WifiOff } from "lucide-react";
import { Alert } from "@/components/atoms/alert";
import { useOnlineStatus } from "@/hooks/ui/useOnlineStatus";

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <Alert
      variant="warning"
      role="status"
      className="flex items-center justify-center gap-2 rounded-none px-4"
    >
      <WifiOff className="size-4" aria-hidden />
      Você está offline. Os dados podem estar desatualizados.
    </Alert>
  );
}
