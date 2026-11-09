import { FileText } from "lucide-react";
import { Alert } from "@/components/atoms/alert";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { Text } from "@/components/atoms/text";
import {
  CostPayerList,
  CostPayerListSkeleton,
} from "@/components/molecules/cost-payer-list";
import { InfoItem } from "@/components/molecules/info-item";
import { PartnerProposalStatusBadge } from "@/components/molecules/partner-proposal-status-badge";
import {
  PartnerAreaProposalAccept,
  PartnerAreaProposalReject,
} from "@/components/organisms/partner-area-proposal-decision";
import { LABEL_MAPS } from "@/constants/label-maps";
import { offerRateText } from "@/helpers/partner";
import { contractTerms, periodText } from "@/helpers/partner-area";
import { usePartnerProposalDocument } from "@/hooks/api/parceiro/area/usePartnerProposals";
import { useLabels } from "@/hooks/ui/useLabels";
import type { PartnerAreaProposal } from "@/types/partner-area";
import {
  formatCalendarDate,
  formatCurrency,
  formatDate,
  formatDateTime,
} from "@/utils/format";
import { formatPlate } from "@/utils/plate";
import { pluralize } from "@/utils/text";

const TABLE_HEADERS = ["Veículo", "Aquisição", "Locação oferecida", "Entra em"];
const RIGHT = ["Aquisição", "Locação oferecida"];

/**
 * A contract the company proposes to the partner: the terms, who pays each
 * expense and the vehicles with the rent offered for each — cards on the
 * phone, a table on the desktop. The PDF is the text being agreed to; a
 * pending version is accepted (with the "li e concordo" tick) or refused
 * (with the reason).
 */
export function PartnerAreaProposalCard({
  proposal,
}: {
  proposal: PartnerAreaProposal;
}) {
  const { label } = useLabels();
  const pdf = usePartnerProposalDocument();
  const { version } = proposal;
  const terms = contractTerms(proposal, label);
  const pending = version.status === "PROPOSED";

  return (
    <Card className={pending ? "border-primary/40" : undefined}>
      <CardHeader className="gap-2 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <Box className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">
            {label(LABEL_MAPS.partnerContractType, proposal.type)}
          </CardTitle>
          <Text inline size="xs" tone="muted" mono>
            {proposal.code} · versão {version.number}
          </Text>
        </Box>
        {version.status === "ACCEPTED" && version.decidedAt ? (
          <Badge variant="success" className="self-start sm:self-auto">
            Aceita em {formatDate(version.decidedAt)} — aguardando assinatura
          </Badge>
        ) : (
          <Box className="self-start sm:self-auto">
            <PartnerProposalStatusBadge status={version.status} area />
          </Box>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <Row as="dl" className="gap-y-4">
          <InfoItem label="Vigência" span={6} md={3}>
            {periodText(proposal.startDate, proposal.endDate)}
          </InfoItem>
          {terms.map((term) => (
            <InfoItem key={term.label} label={term.label} span={6} md={3}>
              {term.value}
            </InfoItem>
          ))}
          <InfoItem label="Quem paga as despesas">
            <CostPayerList costs={proposal.costs} />
          </InfoItem>
        </Row>

        <Box className="space-y-3">
          <Heading level={3} variant="section">
            {pluralize(proposal.vehicles.length, "veículo", "veículos")}
          </Heading>
          {proposal.vehicles.length === 0 ? (
            <Text tone="muted">Nenhum veículo nesta proposta.</Text>
          ) : (
            <>
              <List className="space-y-3 md:hidden">
                {proposal.vehicles.map((vehicle) => {
                  const offer = offerRateText(
                    vehicle.offerRate,
                    vehicle.offerRatePeriod,
                  );
                  return (
                    <ListItem
                      key={vehicle.vehicleId}
                      className="space-y-1 rounded-lg border bg-card px-4 py-3"
                    >
                      <Text size="base" weight="semibold">
                        {vehicle.label ?? "Veículo"}
                      </Text>
                      <Text size="xs" tone="muted">
                        {vehicle.plate
                          ? formatPlate(vehicle.plate)
                          : "Sem placa"}
                        {vehicle.acquisitionValue !== null &&
                          ` · aquisição ${formatCurrency(vehicle.acquisitionValue)}`}
                      </Text>
                      <Text size="sm" className="tabular-nums">
                        <Text inline size={null} tone="muted">
                          Locação oferecida{" "}
                        </Text>
                        <Text inline size={null} weight="semibold">
                          {offer ?? "—"}
                        </Text>
                      </Text>
                      <Text size="xs" tone="muted">
                        Entra no contrato em{" "}
                        {formatCalendarDate(vehicle.joinedAt)}
                      </Text>
                    </ListItem>
                  );
                })}
              </List>
              <Box className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {TABLE_HEADERS.map((header) => (
                        <TableHead
                          key={header}
                          className={
                            RIGHT.includes(header) ? "text-right" : undefined
                          }
                        >
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proposal.vehicles.map((vehicle) => (
                      <TableRow key={vehicle.vehicleId}>
                        <TableCell className="whitespace-normal">
                          <Text weight="medium">
                            {vehicle.label ?? "Veículo"}
                          </Text>
                          <Text size="xs" tone="muted">
                            {vehicle.plate ? formatPlate(vehicle.plate) : "—"}
                          </Text>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {vehicle.acquisitionValue !== null
                            ? formatCurrency(vehicle.acquisitionValue)
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {offerRateText(
                            vehicle.offerRate,
                            vehicle.offerRatePeriod,
                          ) ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatCalendarDate(vehicle.joinedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </>
          )}
        </Box>

        {version.status === "REJECTED" && (
          <Alert variant="info" role="note">
            Você recusou
            {version.decidedAt && ` em ${formatDateTime(version.decidedAt)}`}
            {version.decisionNote && `: “${version.decisionNote}”`}. A locadora
            pode mandar uma nova versão.
          </Alert>
        )}
        {pending && (
          <Text size="xs" tone="muted">
            Recebida em {formatDateTime(version.createdAt)}. Leia o contrato
            antes de responder: o aceite vale para esta versão.
          </Text>
        )}

        <Box className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant={pending ? "ghost" : "outline"}
            className="w-full sm:mr-auto sm:w-auto"
            disabled={pdf.isPending}
            onClick={() =>
              pdf.mutate({
                contractId: proposal.contractId,
                versionId: version.id,
              })
            }
          >
            {pdf.isPending ? <Spinner /> : <FileText />}
            Ver contrato (PDF)
          </Button>
          {pending && (
            <>
              <PartnerAreaProposalReject proposal={proposal} />
              <PartnerAreaProposalAccept proposal={proposal} />
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export function PartnerAreaProposalCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <Box className="flex items-center gap-2">
          <Skeleton shape="text" className="w-28 text-base" />
          <Skeleton shape="text" className="w-32 text-xs" />
        </Box>
        <Skeleton shape="pill" className="h-5 w-28" />
      </CardHeader>
      <CardContent className="space-y-6">
        <Row className="gap-y-4">
          {["w-28", "w-32", "w-24", "w-20"].map((width, index) => (
            <Col key={index} span={6} md={3} className="space-y-2">
              <Skeleton shape="text" className="w-16 text-xs" />
              <Skeleton shape="text" className={`${width} text-sm`} />
            </Col>
          ))}
          <Col className="space-y-2">
            <Skeleton shape="text" className="w-36 text-xs" />
            <CostPayerListSkeleton />
          </Col>
        </Row>
        <Box className="space-y-3">
          <Skeleton shape="text" className="w-20 text-base" />
          <Skeleton className="h-24 md:h-16" />
        </Box>
        <Box className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Skeleton className="h-11 sm:mr-auto sm:w-44 md:h-9" />
          <Skeleton className="h-11 sm:w-28 md:h-9" />
          <Skeleton className="h-11 sm:w-28 md:h-9" />
        </Box>
      </CardContent>
    </Card>
  );
}
