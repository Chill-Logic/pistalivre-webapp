import { BadgeCheck, KeyRound } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Text } from "@/components/atoms/text";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { WalletKey } from "@/types/portal";

/** A validated pix key: the owner and bank confirmed on registration. */
export function WalletKeyItem({
  walletKey,
  actions,
}: {
  walletKey: WalletKey;
  /** Make default / remove. */
  actions?: ReactNode;
}) {
  const { label } = useLabels();
  const owner = [walletKey.ownerName, walletKey.bank].filter(Boolean);

  return (
    <Box className="flex items-start gap-3 py-3">
      <KeyRound
        className="mt-0.5 size-5 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <Box className="min-w-0 flex-1 space-y-1">
        <Box className="flex flex-wrap items-center gap-2">
          <Text weight="medium" className="break-all">
            {walletKey.pixKey}
          </Text>
          {walletKey.isDefault && <Badge variant="neutral">Padrão</Badge>}
        </Box>
        <Text size="xs" tone="muted">
          {label(LABEL_MAPS.pixKeyType, walletKey.pixKeyType)}
          {owner.length > 0 && ` · ${owner.join(" · ")}`}
        </Text>
        {walletKey.validatedAt && (
          <Text
            size="xs"
            className="flex items-center gap-1 text-success-foreground"
          >
            <BadgeCheck className="size-3.5" aria-hidden />
            Chave validada
          </Text>
        )}
      </Box>
      {actions && (
        <Box className="flex shrink-0 items-center gap-1">{actions}</Box>
      )}
    </Box>
  );
}
