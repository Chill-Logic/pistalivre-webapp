import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { InfoItem } from "@/components/molecules/info-item";
import { SignatureStatusBadge } from "@/components/molecules/signature-status-badge";
import { TextLink } from "@/components/molecules/text-link";
import { LABEL_MAPS } from "@/constants/label-maps";
import { documentOwnerHref } from "@/helpers/signature";
import { useLabels } from "@/hooks/ui/useLabels";
import type { SignatureDetail } from "@/types/signature";
import { formatDate, formatDateTime } from "@/utils/format";
import { pluralize } from "@/utils/text";

export function SignatureSummary({ signature }: { signature: SignatureDetail }) {
  const { label } = useLabels();
  const { document } = signature;
  const ownerLabel = document
    ? label(LABEL_MAPS.documentOwner, document.ownerType)
    : null;
  const ownerHref = document
    ? documentOwnerHref(document.ownerType, document.ownerId)
    : null;

  return (
    <Card>
      <CardHeader>
        <Box className="flex flex-wrap items-start justify-between gap-2">
          <Heading className="min-w-0 break-words">{signature.name}</Heading>
          <SignatureStatusBadge status={signature.status} />
        </Box>
      </CardHeader>
      <CardContent>
        <Row as="dl" className="gap-y-4">
          <InfoItem md={6} label="Documento de">
            {!document ? (
              "Documento removido"
            ) : ownerHref ? (
              <TextLink to={ownerHref}>{ownerLabel}</TextLink>
            ) : (
              ownerLabel
            )}
          </InfoItem>
          <InfoItem md={6} label="Origem do pedido">
            {signature.source === "IMPORTED"
              ? "Vinculado de um envelope existente"
              : "Criado aqui"}
          </InfoItem>
          <InfoItem md={6} label="Prazo">
            {signature.deadlineAt ? formatDate(signature.deadlineAt) : null}
          </InfoItem>
          <InfoItem md={6} label="Lembrete">
            {`A cada ${pluralize(signature.remindInterval, "dia", "dias")}`}
          </InfoItem>
          <InfoItem md={6} label="Encerrar ao assinarem todos">
            {signature.autoClose ? "Sim" : "Não"}
          </InfoItem>
          <InfoItem md={6} label="Criado em">
            {formatDateTime(signature.createdAt)}
          </InfoItem>
          {signature.sentAt && (
            <InfoItem md={6} label="Enviado em">
              {formatDateTime(signature.sentAt)}
            </InfoItem>
          )}
          {signature.signedAt && (
            <InfoItem md={6} label="Assinado em">
              {formatDateTime(signature.signedAt)}
            </InfoItem>
          )}
          {signature.message && (
            <InfoItem label="Mensagem aos signatários">
              {signature.message}
            </InfoItem>
          )}
        </Row>
      </CardContent>
    </Card>
  );
}

export function SignatureSummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Box className="flex items-start justify-between gap-2">
          <Skeleton shape="text" className="w-1/2 text-2xl" />
          <Skeleton shape="pill" className="h-5 w-20" />
        </Box>
      </CardHeader>
      <CardContent>
        <Row className="gap-y-4">
          {Array.from({ length: 6 }, (_, index) => (
            <Col key={index} md={6} className="space-y-2">
              <Skeleton shape="text" className="w-20 text-xs" />
              <Skeleton shape="text" className="w-32 text-sm" />
            </Col>
          ))}
        </Row>
      </CardContent>
    </Card>
  );
}
