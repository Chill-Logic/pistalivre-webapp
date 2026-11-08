import { PenLine } from "lucide-react";
import { useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  DocumentsCard,
  DocumentsCardSkeleton,
} from "@/components/organisms/documents-card";
import { QueryError } from "@/components/organisms/query-error";
import { SignatureActions } from "@/components/organisms/signature-actions";
import { SignatureBlockers } from "@/components/organisms/signature-blockers";
import { SignatureSendDialog } from "@/components/organisms/signature-send-dialog";
import { SignatureSettingsForm } from "@/components/organisms/signature-settings-form";
import { SignatureSignersEditor } from "@/components/organisms/signature-signers-editor";
import {
  SignatureSignersCard,
  SignatureSignersCardSkeleton,
} from "@/components/organisms/signature-signers-card";
import {
  SignatureSummary,
  SignatureSummarySkeleton,
} from "@/components/organisms/signature-summary";
import { SignatureDetailLayout } from "@/components/templates/signature-detail-layout";
import { ROUTES } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useSignature } from "@/hooks/api/gestao/signatures/useSignature";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function SignatureDetailPage() {
  const { id = "" } = useParams();
  const signature = useSignature(id);
  const backTo = useBackToList(ROUTES.signatures);
  const data = signature.data;

  return (
    <Box className="space-y-4">
      <Box className="flex flex-wrap items-center justify-between gap-2">
        <BackLink to={backTo} label="Assinaturas" />
        {data && (
          <Box className="flex flex-wrap justify-end gap-2">
            <SignatureActions signature={data} />
            {data.status === "DRAFT" && (
              <SignatureSendDialog signature={data} />
            )}
          </Box>
        )}
      </Box>
      {signature.isPending && (
        <SkeletonRegion label="Carregando pedido de assinatura…">
          <SignatureDetailLayout
            summary={<SignatureSummarySkeleton />}
            signers={<SignatureSignersCardSkeleton />}
            document={<DocumentsCardSkeleton />}
          />
        </SkeletonRegion>
      )}
      {signature.isError &&
        (isNotFound(signature.error) ? (
          <EmptyState
            icon={PenLine}
            title="Pedido de assinatura não encontrado"
            description="Ele pode ter sido excluído ou o endereço está errado."
          />
        ) : (
          <QueryError
            error={signature.error}
            onRetry={() => signature.refetch()}
          />
        ))}
      {data && (
        <SignatureDetailLayout
          blockers={
            data.status === "DRAFT" && data.blockers.length > 0 ? (
              <SignatureBlockers blockers={data.blockers} />
            ) : null
          }
          summary={<SignatureSummary signature={data} />}
          settings={
            data.status === "DRAFT" ? (
              <SignatureSettingsForm key={data.updatedAt} signature={data} />
            ) : null
          }
          signers={
            data.status === "DRAFT" ? (
              <SignatureSignersEditor
                key={data.updatedAt}
                signatureId={data.id}
                signers={data.signers}
              />
            ) : (
              <SignatureSignersCard
                signers={data.signers}
                resendFor={data.status === "SENT" ? data.id : undefined}
              />
            )
          }
          document={
            <DocumentsCard
              title="Documento a assinar"
              documents={data.document ? [data.document] : []}
              empty="O PDF deste pedido não existe mais."
            />
          }
        />
      )}
    </Box>
  );
}
