import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CollapsibleCard } from "@/components/molecules/collapsible-card";
import {
  SignatureCard,
  SignatureCardSkeleton,
} from "@/components/molecules/signature-card";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
import { useOwnerSignatures } from "@/hooks/api/gestao/signatures/useOwnerSignatures";
import { pluralize } from "@/utils/text";

type OwnerSignaturesProps = {
  ownerType: "CUSTOMER" | "RENTAL";
  ownerId: string;
};

/**
 * Signature requests over the PDFs of one customer or rental, each with its
 * situation and a link to the request. Loads on its own.
 */
export function OwnerSignatures({ ownerType, ownerId }: OwnerSignaturesProps) {
  const query = useOwnerSignatures({ ownerType, ownerId });
  const items = query.data?.items ?? [];

  return (
    <CollapsibleCard
      title="Assinaturas"
      count={query.data?.total}
      storageKey={`${ownerType === "RENTAL" ? "rental" : "customer"}-signatures`}
      contentClassName="space-y-3"
    >
      {query.isPending && (
        <SkeletonRegion label="Carregando assinaturas…">
          <OwnerSignaturesGrid />
        </SkeletonRegion>
      )}
      {query.isError && (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      )}
      {query.data && items.length === 0 && (
        <Text tone="muted">
          Nenhum documento{" "}
          {ownerType === "RENTAL" ? "desta locação" : "deste cliente"} foi posto
          em assinatura.
        </Text>
      )}
      {items.length > 0 && (
        <Row as="ul" className="gap-y-4">
          {items.map((signature) => (
            <Col as="li" key={signature.id} md={6}>
              <SignatureCard signature={signature} />
            </Col>
          ))}
        </Row>
      )}
      {query.data && query.data.total > items.length && (
        <Text size="xs" tone="muted">
          Mostrando {items.length} de{" "}
          {pluralize(query.data.total, "pedido", "pedidos")}.
        </Text>
      )}
    </CollapsibleCard>
  );
}

function OwnerSignaturesGrid() {
  return (
    <Row className="gap-y-4">
      <Col md={6}>
        <SignatureCardSkeleton />
      </Col>
      <Col md={6} className="hidden md:block">
        <SignatureCardSkeleton />
      </Col>
    </Row>
  );
}

export function OwnerSignaturesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-28 text-base" />
      </CardHeader>
      <CardContent>
        <OwnerSignaturesGrid />
      </CardContent>
    </Card>
  );
}
