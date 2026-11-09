import { FileSignature, FileText, Send, Undo2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { PartnerProposalStatusBadge } from "@/components/molecules/partner-proposal-status-badge";
import { QueryError } from "@/components/organisms/query-error";
import { routeTo } from "@/constants/routes";
import { currentVehicles, proposalDecisionText } from "@/helpers/partner";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import {
  useRequestPartnerProposalSignature,
  useWithdrawPartnerProposal,
} from "@/hooks/api/gestao/partners/usePartnerContractMutations";
import { usePartnerContractProposals } from "@/hooks/api/gestao/partners/usePartners";
import type { PartnerContract, PartnerProposalVersion } from "@/types/partner";
import { formatDateTime } from "@/utils/format";

/**
 * The contract as a versioned proposal: each version the partner received
 * (sent, accepted, refused, withdrawn, replaced) with its PDF. From the
 * accepted one the request goes to Clicksign (Assinaturas). A draft sends a
 * new version through the editor; an active contract is locked.
 */
export function PartnerContractProposalCard({
  contract,
}: {
  contract: PartnerContract;
}) {
  const query = usePartnerContractProposals(contract.id);
  const isDraft = contract.status === "DRAFT";
  const hasVehicles = currentVehicles(contract).length > 0;

  if (query.isPending) return <PartnerContractProposalCardSkeleton />;

  const versions = query.data?.items ?? [];
  const termsChanged =
    isDraft &&
    Boolean(query.data?.acceptedVersionId) &&
    !query.data?.acceptedMatchesTerms;

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Proposta ao parceiro</CardTitle>
        {isDraft &&
          (hasVehicles ? (
            <Button asChild size="sm">
              <Link to={routeTo.partnerContractDocument(contract.id)}>
                <Send />
                {versions.length ? "Enviar nova versão" : "Enviar proposta"}
              </Link>
            </Button>
          ) : (
            <Button size="sm" disabled>
              <Send />
              Enviar proposta
            </Button>
          ))}
      </CardHeader>
      <CardContent className="space-y-4">
        {query.isError ? (
          <QueryError error={query.error} onRetry={() => query.refetch()} />
        ) : (
          <>
            {termsChanged && (
              <Alert variant="warning" role="note">
                Os termos mudaram desde o aceite: envie uma nova proposta.
              </Alert>
            )}
            {versions.length === 0 ? (
              <Text tone="muted">
                {hasVehicles
                  ? "Nenhuma versão enviada. Monte o texto do contrato e envie: o parceiro aceita ou recusa na área dele."
                  : "Inclua ao menos um veículo para montar e enviar a proposta ao parceiro."}
              </Text>
            ) : (
              <List className="divide-y" aria-label="Versões da proposta">
                {versions.map((version) => (
                  <ProposalVersionItem
                    key={version.id}
                    contract={contract}
                    version={version}
                    isAccepted={version.id === query.data?.acceptedVersionId}
                  />
                ))}
              </List>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ProposalVersionItem({
  contract,
  version,
  isAccepted,
}: {
  contract: PartnerContract;
  version: PartnerProposalVersion;
  isAccepted: boolean;
}) {
  const navigate = useNavigate();
  const { view } = useFileActions();
  const withdraw = useWithdrawPartnerProposal(contract.id);
  const signature = useRequestPartnerProposalSignature(contract.id);
  const decision = proposalDecisionText(version);
  const file = version.document;
  const viewing = view.isPending && view.variables?.url === file?.url;

  const requestSignature = () =>
    signature.mutate(version.id, {
      onSuccess: ({ signatureRequestId }) =>
        navigate(routeTo.signature(signatureRequestId)),
    });

  return (
    <ListItem className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
      <Box className="min-w-0 space-y-1">
        <Box className="flex flex-wrap items-center gap-2">
          <Text weight="semibold">Versão {version.number}</Text>
          <PartnerProposalStatusBadge status={version.status} />
        </Box>
        <Text size="xs" tone="muted" className="tabular-nums">
          Enviada em {formatDateTime(version.createdAt)}
          {decision && ` · ${decision}`}
        </Text>
        {version.status === "REJECTED" && version.decisionNote && (
          <Text size="sm">
            <Text inline size={null} tone="muted">
              Motivo:{" "}
            </Text>
            {version.decisionNote}
          </Text>
        )}
        {version.decidedIp && (
          <Text size="xs" tone="muted" mono>
            IP {version.decidedIp}
          </Text>
        )}
      </Box>
      <Box className="-ml-2 flex shrink-0 flex-wrap items-center gap-1 sm:ml-0 sm:justify-end">
        {file && (
          <Button
            variant="ghost"
            size="sm"
            disabled={viewing}
            onClick={() => view.mutate(file)}
            aria-label={`PDF da versão ${version.number}`}
          >
            {viewing ? <Spinner /> : <FileText />}
            PDF
          </Button>
        )}
        {version.status === "PROPOSED" && (
          <ConfirmDialog
            destructive
            trigger={
              <Button variant="ghost" size="sm" className="text-destructive">
                <Undo2 />
                Retirar proposta
              </Button>
            }
            title={`Retirar a versão ${version.number}?`}
            description="O parceiro deixa de ver esta proposta e não pode mais aceitá-la. Depois, envie uma nova versão quando quiser."
            confirmLabel="Retirar"
            isPending={withdraw.isPending}
            onConfirm={() => withdraw.mutate(version.id)}
          />
        )}
        {isAccepted &&
          (version.signatureRequestId ? (
            <Button asChild variant="outline" size="sm">
              <Link to={routeTo.signature(version.signatureRequestId)}>
                <FileSignature />
                Ver assinatura
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={signature.isPending}
              onClick={requestSignature}
            >
              {signature.isPending ? (
                <Spinner className="text-primary-foreground" />
              ) : (
                <FileSignature />
              )}
              Enviar para assinatura
            </Button>
          ))}
      </Box>
    </ListItem>
  );
}

export function PartnerContractProposalCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <Skeleton shape="text" className="w-44 text-base" />
        <Skeleton className="h-9 w-36 md:h-8" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[0, 1].map((index) => (
          <Box
            key={index}
            className="flex flex-col gap-3 sm:flex-row sm:justify-between"
          >
            <Box className="space-y-2">
              <Box className="flex items-center gap-2">
                <Skeleton shape="text" className="w-20 text-sm" />
                <Skeleton shape="pill" className="h-5 w-16" />
              </Box>
              <Skeleton shape="text" className="w-64 text-xs" />
            </Box>
            <Skeleton className="h-9 w-20 md:h-8" />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
