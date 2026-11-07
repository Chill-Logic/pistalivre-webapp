import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { InfoItem } from "@/components/molecules/info-item";
import { ProposalStatusBadge } from "@/components/molecules/proposal-status-badge";
import { TextLink } from "@/components/molecules/text-link";
import { routeTo } from "@/constants/routes";
import type { ProposalDetail } from "@/types/proposal";
import { formatPhone } from "@/utils/document";
import { formatDateTime } from "@/utils/format";

export function ProposalSummary({ proposal }: { proposal: ProposalDetail }) {
  const { recipient } = proposal;

  return (
    <Card>
      <CardHeader>
        <Box className="flex flex-wrap items-start justify-between gap-2">
          <Heading className="min-w-0 break-words">{recipient.name}</Heading>
          <ProposalStatusBadge status={proposal.status} />
        </Box>
      </CardHeader>
      <CardContent>
        <Row as="dl" className="gap-y-4">
          <InfoItem md={6} label="Telefone">
            {recipient.phone ? formatPhone(recipient.phone) : null}
          </InfoItem>
          <InfoItem md={6} label="E-mail">
            {recipient.email}
          </InfoItem>
          <InfoItem md={6} label="Origem">
            {proposal.lead ? (
              <TextLink to={routeTo.lead(proposal.lead.id)}>
                Lead do CRM · {proposal.lead.name}
              </TextLink>
            ) : (
              "Avulsa (fora do funil)"
            )}
          </InfoItem>
          <InfoItem md={6} label="Veículo">
            {proposal.vehicle ? (
              <TextLink to={routeTo.vehicle(proposal.vehicle.id)}>
                {proposal.vehicle.label} · {proposal.vehicle.plate}
              </TextLink>
            ) : null}
          </InfoItem>
          <InfoItem md={6} label="Modelo">
            {proposal.template
              ? `${proposal.template.name} · v${proposal.template.version}`
              : null}
          </InfoItem>
          <InfoItem md={6} label="Emitida em">
            {formatDateTime(proposal.createdAt)}
          </InfoItem>
          {proposal.clauses.length > 0 && (
            <InfoItem label="Cláusulas opcionais">
              {proposal.clauses.map((clause) => clause.label).join(", ")}
            </InfoItem>
          )}
          {proposal.status === "REJECTED" && (
            <InfoItem label="Motivo da recusa">
              {proposal.rejectionReason}
            </InfoItem>
          )}
        </Row>
      </CardContent>
    </Card>
  );
}

export function ProposalSummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Box className="flex items-start justify-between gap-2">
          <Skeleton shape="text" className="w-1/2 text-2xl" />
          <Skeleton shape="pill" className="h-5 w-16" />
        </Box>
      </CardHeader>
      <CardContent>
        <Row className="gap-y-4">
          {Array.from({ length: 6 }, (_, index) => (
            <Col key={index} md={6} className="space-y-2">
              <Skeleton shape="text" className="w-16 text-xs" />
              <Skeleton shape="text" className="w-32 text-sm" />
            </Col>
          ))}
        </Row>
      </CardContent>
    </Card>
  );
}
