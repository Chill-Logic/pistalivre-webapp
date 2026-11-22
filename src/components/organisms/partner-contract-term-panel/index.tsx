import { Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { AiDocumentEditor } from "@/components/organisms/ai-document-editor";
import { QueryError } from "@/components/organisms/query-error";
import {
  useContractDraftSync,
  type ContractDraftSync,
} from "@/hooks/api/gestao/contracts/useContractDraftSync";
import {
  usePartnerInstrumentPreview,
  useRemovePartnerInstrument,
} from "@/hooks/api/gestao/partners/usePartnerContractMutations";
import { usePartnerInstrumentTextDraft } from "@/hooks/api/gestao/partners/usePartners";
import type { ContractDraftState } from "@/types/contract";
import type { PartnerContractInstrument } from "@/types/partner";

/** What the page needs of a term's living text (sending, the chat beside it). */
export type PartnerTermDraftHandle = Pick<ContractDraftSync, "id" | "flush" | "apply" | "replace">;

type PartnerContractTermPanelProps = {
  contractId: string;
  instrument: PartnerContractInstrument;
  /** This term's tab is the one open (the chat edits it). */
  active: boolean;
  /** Its text, once open (null = gone): flushed on sending, the chat's answers go to it. */
  onRegister: (instrumentId: string, handle: PartnerTermDraftHandle | null) => void;
  /** The open term's current text, for the chat. */
  onActiveHtml: (instrumentId: string, draftId: string, html: string) => void;
  /** Removed: the page goes back to the contract's tab. */
  onRemoved: () => void;
  aiEnabled: boolean;
  cancelTo: string;
};

/**
 * One document that goes with the partner contract — the contribution term
 * (the partner paid for the vehicles in the company's name) or an "Outro
 * termo" named by the staff — with a living text like the contract's. It goes
 * with the contract to the partner's review and in the same signature envelope.
 */
export function PartnerContractTermPanel(props: PartnerContractTermPanelProps) {
  const { contractId, instrument } = props;
  const query = usePartnerInstrumentTextDraft(contractId, instrument.id);

  if (query.isPending) {
    return (
      <SkeletonRegion label="Abrindo o termo…">
        <PartnerContractTermPanelSkeleton />
      </SkeletonRegion>
    );
  }
  if (query.isError) {
    return <QueryError error={query.error} onRetry={() => query.refetch()} />;
  }
  return (
    // The text keeps its own sync, keyed by its draft (removed and included again = a new text).
    <TermEditor
      key={query.data.draft.id}
      {...props}
      initial={query.data.draft}
      aiEnabled={query.data.aiEnabled ?? props.aiEnabled}
    />
  );
}

function TermEditor({
  contractId,
  instrument,
  active,
  onRegister,
  onActiveHtml,
  onRemoved,
  aiEnabled,
  cancelTo,
  initial,
}: PartnerContractTermPanelProps & { initial: ContractDraftState }) {
  const sync = useContractDraftSync(initial);
  const remove = useRemovePartnerInstrument(contractId);
  const preview = usePartnerInstrumentPreview(contractId, instrument.id);
  // `replace` is rebuilt every render: the page calls the latest one.
  const replace = useRef(sync.replace);
  useEffect(() => {
    replace.current = sync.replace;
  });

  const { id, flush, apply, html } = sync;
  useEffect(() => {
    onRegister(instrument.id, {
      id,
      flush,
      apply,
      replace: (next) => replace.current(next),
    });
    return () => onRegister(instrument.id, null);
  }, [onRegister, instrument.id, id, flush, apply]);

  useEffect(() => {
    if (active) onActiveHtml(instrument.id, id, html);
  }, [active, onActiveHtml, instrument.id, id, html]);

  const isContribution = instrument.kind === "CONTRIBUTION_TERM";
  return (
    <Box className="space-y-3">
      {!instrument.allowed && (
        <Alert variant="info" role="note">
          Este termo não combina mais com o tipo do contrato. Remova-o se ele
          não deve ir junto.
        </Alert>
      )}
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
          title={isContribution ? "Remover o termo de aporte?" : `Remover “${instrument.title}”?`}
          description={`O texto do termo sai do contrato e não vai mais junto na revisão nem na assinatura.${isContribution ? " Dá para incluir de novo depois, a partir do texto padrão." : ""}`}
          confirmLabel="Remover termo"
          destructive
          isPending={remove.isPending}
          onConfirm={() => remove.mutate(instrument.id, { onSuccess: onRemoved })}
        />
      </Box>
      <AiDocumentEditor
        initialHtml={sync.html}
        draft={sync}
        aiEnabled={aiEnabled}
        intro="Rascunho vivo, como o do contrato: edite aqui ou peça ao Livrinho ao lado (com esta aba aberta, ele mexe neste termo). Ele é enviado junto com o contrato."
        label={`Texto de “${instrument.title}”`}
        cancelTo={cancelTo}
        onPreview={(text) => preview.mutate(text)}
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
