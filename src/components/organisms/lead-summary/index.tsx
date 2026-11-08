import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { InfoItem } from "@/components/molecules/info-item";
import { LeadStatusBadge } from "@/components/molecules/lead-status-badge";
import { TextLink } from "@/components/molecules/text-link";
import { routeTo } from "@/constants/routes";
import { touchLabel } from "@/helpers/crm";
import type { LeadDetail } from "@/types/crm";
import { formatPhone } from "@/utils/document";
import { formatDateTime } from "@/utils/format";

export function LeadSummary({ lead }: { lead: LeadDetail }) {
  return (
    <Card>
      <CardHeader>
        <Box className="flex flex-wrap items-start justify-between gap-2">
          <Heading className="min-w-0 break-words">{lead.name}</Heading>
          <LeadStatusBadge status={lead.status} isTest={lead.isTest} />
        </Box>
      </CardHeader>
      <CardContent>
        <Row as="dl" className="gap-y-4">
          <InfoItem md={6} label="Telefone">
            {lead.phone ? formatPhone(lead.phone) : null}
          </InfoItem>
          <InfoItem md={6} label="E-mail">
            {lead.email}
          </InfoItem>
          <InfoItem md={6} label="Veículo desejado">
            {lead.desiredVehicle ?? lead.interest}
          </InfoItem>
          <InfoItem md={6} label="Entrou em">
            {formatDateTime(lead.createdAt)}
          </InfoItem>
          <InfoItem md={6} label="Origem">
            {touchLabel(lead.first)}
          </InfoItem>
          {lead.customerId && (
            <InfoItem md={6} label="Cliente">
              <TextLink to={routeTo.customer(lead.customerId)}>
                Ver ficha do cliente
              </TextLink>
            </InfoItem>
          )}
          {lead.reopenedFromId && (
            <InfoItem md={6} label="Retomado de">
              <TextLink to={routeTo.lead(lead.reopenedFromId)}>
                Lead anterior
              </TextLink>
            </InfoItem>
          )}
        </Row>
      </CardContent>
    </Card>
  );
}

export function LeadSummarySkeleton() {
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
          {Array.from({ length: 5 }, (_, index) => (
            <Col key={index} md={6} className="space-y-2">
              <Skeleton shape="text" className="w-24 text-xs" />
              <Skeleton shape="text" className="w-40 text-sm" />
            </Col>
          ))}
        </Row>
      </CardContent>
    </Card>
  );
}
