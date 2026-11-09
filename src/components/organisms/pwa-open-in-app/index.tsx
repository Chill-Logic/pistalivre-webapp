import { Download, Smartphone } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/popover";
import { Text } from "@/components/atoms/text";
import { hasPwa, installPrompt, isAndroid } from "@/helpers/pwa";
import { useMarkPwaInstalled } from "@/hooks/api/comum/session/usePwaInvite";
import { useInstallPrompt } from "@/hooks/ui/useInstallPrompt";
import { useIsMobileBrowser } from "@/hooks/ui/useIsMobileBrowser";
import type { AuthUser } from "@/types/auth";

/**
 * For whoever already used (or downloaded) the app but is in the phone's
 * browser: a quiet "Abrir no app" in the header, always there while that
 * holds. Never alongside the install invite (that one is for who never had
 * the app). If the browser still offers to install, the app isn't really
 * there (uninstalled, never finished): offer "Instalar" instead.
 */
export function PwaOpenInApp({
  user,
  compact = false,
}: {
  user: AuthUser;
  /** Short label ("App"), for a header with more buttons (the portal's). */
  compact?: boolean;
}) {
  const isMobileBrowser = useIsMobileBrowser();
  const hasNativePrompt = useInstallPrompt();
  const markInstalled = useMarkPwaInstalled();

  if (!isMobileBrowser || !hasPwa(user.pwa)) return null;

  const install = () => {
    markInstalled.mutate();
    void installPrompt.open();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 px-2"
          aria-label="Abrir no app"
        >
          <Smartphone />
          {compact ? "App" : "Abrir no app"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-3 p-4">
        {hasNativePrompt ? (
          <>
            <Text size="sm">
              O app não está instalado neste celular. Instale para abrir direto
              da tela inicial.
            </Text>
            <Box className="flex justify-end">
              <Button size="sm" onClick={install}>
                <Download />
                Instalar
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Text size="sm" weight="semibold">
              Você já tem o app
            </Text>
            <Text size="sm">
              Abra pelo ícone{" "}
              <Text inline weight="semibold">
                Pista Livre
              </Text>{" "}
              na tela inicial do celular
              {isAndroid() ? (
                <>
                  {" "}
                  ou, no Chrome, toque em{" "}
                  <Text inline weight="semibold">
                    ⋮ → Abrir no app
                  </Text>
                  .
                </>
              ) : (
                "."
              )}
            </Text>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
