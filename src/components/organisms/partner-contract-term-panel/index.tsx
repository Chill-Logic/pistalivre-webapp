import { FileSignature, Plus, Trash2 } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { AiDocumentEditor } from "@/components/organisms/ai-document-editor";
import type { ContractDraftSync } from "@/hooks/api/gestao/contracts/useContractDraftSync";
import {
  useAddPartnerInstrument,
  usePartnerInstrumentPreview,
  useRemovePartnerInstrument,
} from "@/hooks/api/gestao/partners/usePartnerContractMutations";
import type { PartnerContractInstrument } from "@/types/partner";

type PartnerContractTermPanelProps = {
  contractId: string;
  /** The term, once included (none = the explanation and "Incluir"). */
  instrument: PartnerContractInstrument | null;
  /** Its living text, synced with the server (null while it opens). */
  draft: ContractDraftSync | null;
  aiEnabled: boolean;
  cancelTo: string;
};

/**
 * "Termo de aporte" (investment only): the partner paid for the vehicles that
 * are in the company's name; at the end they get the vehicles back, not the
 * money. A document of its own, with a living text like the contract's, that
 * goes with it to the partner's review and in the same signature envelope.
 */
export function PartnerContractTermPanel({
  contractId,
  instrument,
  draft,
  aiEnabled,
  cancelTo,
}: PartnerContractTermPanelProps) {
  const add = useAddPartnerInstrument(contractId);
  const remove = useRemovePartnerInstrument(contractId);
  const preview = usePartnerInstrumentPreview(contractId, instrument?.id ?? "");

  if (!instrument) {
    return (
      <EmptyState
        icon={FileSignature}
        title="Termo de aporte"
        description="Para quando o parceiro pagou os veículos que estão no nome da empresa: o termo reconhece o aporte e diz que, no fim do contrato, ele recebe os próprios veículos, e não o dinheiro de volta. Vai junto com o contrato na revisão do parceiro e no mesmo envelope de assinatura."
        action={
          <Button
            type="button"
            onClick={() => add.mutate("CONTRIBUTION_TERM")}
            disabled={add.isPending}
          >
            {add.isPending ? (
              <Spinner className="text-primary-foreground" />
            ) : (
              <Plus />
            )}
            Incluir termo de aporte
          </Button>
        }
      />
    );
  }

  if (!draft) {
    return (
      <SkeletonRegion label="Abrindo o termo…">
        <PartnerContractTermPanelSkeleton />
      </SkeletonRegion>
    );
  }

  return (
    <Box className="space-y-3">
      <Box className="flex flex-wrap items-center justify-between gap-2">
        <Text size="sm" tone="muted">
          Vai junto com o contrato na revisão do parceiro e na assinatura.
        </Text>
        <ConfirmDialog
          trigger={
            <Button type="button" variant="ghost" size="sm" disabled={remove.isPending}>
              {remove.isPending ? <Spinner /> : <Trash2 />}
              Remover termo
            </Button>
          }
          title="Remover o termo de aporte?"
          description="O texto do termo sai do contrato e não vai mais junto na revisão nem na assinatura. Dá para incluir de novo depois, a partir do texto padrão."
          confirmLabel="Remover termo"
          destructive
          isPending={remove.isPending}
          onConfirm={() => remove.mutate(instrument.id)}
        />
      </Box>
      <AiDocumentEditor
        initialHtml={draft.html}
        draft={draft}
        aiEnabled={aiEnabled}
        intro="Rascunho vivo, como o do contrato: edite aqui ou peça ao Livrinho ao lado (com esta aba aberta, ele mexe no termo). Ele é enviado junto com o contrato."
        label="Texto do termo de aporte"
        cancelTo={cancelTo}
        onPreview={(html) => preview.mutate(html)}
        previewing={preview.isPending}
      />
    </Box>
  );
}

export function PartnerContractTermPanelSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4 pt-4 md:pt-6">
        <Skeleton shape="text" className="w-full text-sm" />
        <Skeleton shape="text" className="w-40 text-sm" />
        <Skeleton className="h-96" />
        <Box className="flex justify-end">
          <Skeleton className="h-11 w-36 md:h-9" />
        </Box>
      </CardContent>
    </Card>
  );
}
