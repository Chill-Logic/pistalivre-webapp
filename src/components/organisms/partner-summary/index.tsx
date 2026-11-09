import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { InfoItem } from "@/components/molecules/info-item";
import { partnerDocument } from "@/helpers/partner";
import type { PartnerDetail } from "@/types/partner";
import { formatPhone } from "@/utils/document";
import { formatDate } from "@/utils/format";

export function PartnerSummary({ partner }: { partner: PartnerDetail }) {
  return (
    <Card>
      <CardHeader>
        <Box className="flex flex-wrap items-start justify-between gap-2">
          <Box className="min-w-0">
            <Heading className="break-words">{partner.name}</Heading>
            {partner.tradeName && (
              <Text tone="muted" className="break-words">
                {partner.tradeName}
              </Text>
            )}
          </Box>
          <Badge variant={partner.active ? "success" : "outline"}>
            {partner.active ? "Ativo" : "Inativo"}
          </Badge>
        </Box>
      </CardHeader>
      <CardContent>
        <Row as="dl" className="gap-y-4">
          <InfoItem span={12} sm={6} label="Documento">
            {partnerDocument(partner)}
          </InfoItem>
          <InfoItem span={12} sm={6} label="E-mail">
            <Text inline size={null} className="break-words">
              {partner.email}
            </Text>
          </InfoItem>
          <InfoItem span={6} label="Telefone">
            {partner.phone ? formatPhone(partner.phone) : "Não informado"}
          </InfoItem>
          <InfoItem span={6} label="Cadastrado em">
            {formatDate(partner.createdAt)}
          </InfoItem>
          <InfoItem label="Chave pix (repasse por fora)">
            <Text inline size={null} className="break-all">
              {partner.pixKey ?? "Não informada"}
            </Text>
          </InfoItem>
          {partner.notes && (
            <InfoItem label="Observações">
              <Text inline size={null} className="whitespace-pre-line">
                {partner.notes}
              </Text>
            </InfoItem>
          )}
        </Row>
      </CardContent>
    </Card>
  );
}

export function PartnerSummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-1/2 text-2xl" />
      </CardHeader>
      <CardContent>
        <Row className="gap-y-4">
          {[0, 1, 2, 3].map((index) => (
            <Col key={index} span={index < 2 ? 12 : 6} sm={6} className="space-y-2">
              <Skeleton shape="text" className="w-16 text-xs" />
              <Skeleton shape="text" className="w-32 text-sm" />
            </Col>
          ))}
        </Row>
      </CardContent>
    </Card>
  );
}
