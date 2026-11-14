import { Download, X } from "lucide-react";
import { useState } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Image } from "@/components/atoms/image";
import { Text } from "@/components/atoms/text";
import { PwaInstallStepsDialog } from "@/components/molecules/pwa-install-steps-dialog";
import { installGuide, installPrompt, shouldInviteToPwa } from "@/helpers/pwa";
import {
  useDismissPwaInvite,
  useMarkPwaInstalled,
} from "@/hooks/api/comum/session/usePwaInvite";
import { useInstallPrompt } from "@/hooks/ui/useInstallPrompt";
import { useIsMobileBrowser } from "@/hooks/ui/useIsMobileBrowser";
import type { AuthUser } from "@/types/auth";

/**
 * Invites a phone user who never opened the installed app (nor clicked
 * "Instalar") to install it. "Agora não" snoozes it for 7 days; "Instalar"
 * is recorded and the invite never comes back. Both live in the API, so
 * they follow the person across browsers.
 */
export function PwaInstallInvite({ user }: { user: AuthUser }) {
  const isMobileBrowser = useIsMobileBrowser();
  const hasNativePrompt = useInstallPrompt();
  const dismiss = useDismissPwaInvite();
  const markInstalled = useMarkPwaInstalled();
  const [stepsOpen, setStepsOpen] = useState(false);

  const visible = isMobileBrowser && shouldInviteToPwa(user.pwa);

  const install = () => {
    // Clicking counts as installing: the invite stops (the steps still open).
    markInstalled.mutate();
    if (hasNativePrompt) void installPrompt.open();
    else setStepsOpen(true);
  };

  return (
    <>
      {visible && (
        <Card className="mb-4 flex items-center gap-3 p-3">
          <Image
            src="/pwa-192x192.png"
            alt=""
            className="size-9 shrink-0 rounded-lg"
          />
          <Box className="min-w-0 flex-1">
            <Text weight="semibold">Instale o app</Text>
            <Text size="xs" tone="muted">
              Abre direto da tela inicial.
            </Text>
          </Box>
          <Button variant="outline" size="sm" onClick={install}>
            <Download />
            Instalar
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-1 size-8 shrink-0 text-muted-foreground"
            aria-label="Agora não"
            onClick={() => dismiss.mutate()}
          >
            <X />
          </Button>
        </Card>
      )}
      <PwaInstallStepsDialog
        guide={installGuide()}
        open={stepsOpen}
        onOpenChange={setStepsOpen}
      />
    </>
  );
}
