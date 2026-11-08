import { Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { useWalletMutations } from "@/hooks/api/cliente/finance/useWalletMutations";
import type { WalletKey } from "@/types/portal";

/** "Principal" (when it is not) and remove, with confirmation. */
export function WalletKeyActions({ walletKey }: { walletKey: WalletKey }) {
  const { setDefault, remove } = useWalletMutations();
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      {!walletKey.isDefault && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDefault.mutate(walletKey.id)}
          disabled={setDefault.isPending}
        >
          <Star />
          Principal
        </Button>
      )}
      <ConfirmDialog
        destructive
        open={confirming}
        onOpenChange={setConfirming}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            aria-label={`Remover a chave ${walletKey.pixKey}`}
          >
            <Trash2 />
          </Button>
        }
        title="Remover chave pix?"
        description={
          walletKey.isDefault
            ? "Ela é a sua chave principal: outra chave passa a ser a principal."
            : "Os reembolsos deixam de poder ir para ela."
        }
        confirmLabel="Remover chave"
        isPending={remove.isPending}
        onConfirm={() =>
          remove.mutate(walletKey.id, { onSuccess: () => setConfirming(false) })
        }
      />
    </>
  );
}
