import { PenLine } from "lucide-react";
import { Col, Row } from "@/components/atoms/grid";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  SignatureCard,
  SignatureCardSkeleton,
} from "@/components/molecules/signature-card";
import type { SignatureListItem } from "@/types/signature";
import { cn } from "@/utils/cn";

type SignatureListProps = {
  signatures: SignatureListItem[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
};

export function SignatureList({
  signatures,
  isLoading,
  isRefreshing = false,
}: SignatureListProps) {
  if (isLoading) {
    return (
      <SkeletonRegion label="Carregando assinaturas…">
        <Row as="ul" className="gap-y-6">
          {Array.from({ length: 6 }, (_, index) => (
            <Col as="li" key={index} sm={6} xl={4}>
              <SignatureCardSkeleton />
            </Col>
          ))}
        </Row>
      </SkeletonRegion>
    );
  }

  if (!signatures?.length) {
    return (
      <EmptyState
        icon={PenLine}
        title="Nenhum pedido de assinatura encontrado"
        description="Os documentos assináveis aparecem aqui."
      />
    );
  }

  return (
    <Row
      as="ul"
      aria-busy={isRefreshing}
      className={cn(
        "gap-y-6 transition-opacity duration-200",
        isRefreshing && "pointer-events-none opacity-60",
      )}
    >
      {signatures.map((item) => (
        <Col as="li" key={item.id} sm={6} xl={4}>
          <SignatureCard signature={item} />
        </Col>
      ))}
    </Row>
  );
}
