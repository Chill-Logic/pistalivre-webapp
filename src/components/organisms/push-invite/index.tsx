import { BellRing, X } from "lucide-react";
import { useState } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Text } from "@/components/atoms/text";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { safeStorage } from "@/helpers/safe-storage";
import { useNotificationSettings } from "@/hooks/api/gestao/notifications/useNotifications";
import { useIsMobileBrowser } from "@/hooks/ui/useIsMobileBrowser";
import { usePushDevice } from "@/hooks/ui/usePushDevice";

/** "Agora não" hides the invite on this device for a week. */
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

const snoozed = () => Number(safeStorage.get(STORAGE_KEYS.pushInviteSnooze) ?? 0) > Date.now();

/**
 * "Ative as notificações", at the top of every management screen, for whoever
 * has not turned push on in THIS device: one tap asks the browser and
 * subscribes. Not on a phone's browser (the install invite comes first: on
 * the iPhone push only exists in the installed app), not when the browser
 * blocked notifications, nor when the server has no push keys.
 */
export function PushInvite() {
  const isMobileBrowser = useIsMobileBrowser();
  const settings = useNotificationSettings();
  const publicKey = settings.data?.pushPublicKey ?? null;
  const push = usePushDevice(publicKey);
  const [hidden, setHidden] = useState(snoozed);

  if (isMobileBrowser || hidden || !publicKey || !push.ready || push.subscribed || push.blocker) {
    return null;
  }

  const later = () => {
    safeStorage.set(STORAGE_KEYS.pushInviteSnooze, String(Date.now() + SNOOZE_MS));
    setHidden(true);
  };

  return (
    <Card className="mb-4 flex items-center gap-3 p-3">
      <Box className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <BellRing className="size-5" aria-hidden />
      </Box>
      <Box className="min-w-0 flex-1">
        <Text weight="semibold">Ative as notificações</Text>
        <Text size="xs" tone="muted">
          Pagamentos, assinaturas e tudo da operação chegam aqui, mesmo com o sistema fechado.
        </Text>
      </Box>
      <Button size="sm" disabled={push.busy} onClick={push.enable}>
        Ativar
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="-mr-1 size-8 shrink-0 text-muted-foreground"
        aria-label="Agora não"
        title="Agora não"
        onClick={later}
      >
        <X />
      </Button>
    </Card>
  );
}
