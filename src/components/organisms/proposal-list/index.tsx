import { FileText } from "lucide-react";
import { Col, Row } from "@/components/atoms/grid";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  ProposalCard,
  ProposalCardSkeleton,
} from "@/components/molecules/proposal-card";
import type { ProposalListItem } from "@/types/proposal";
import { cn } from "@/utils/cn";

type ProposalListProps = {
  proposals: ProposalListItem[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
};

export function ProposalList({
  proposals,
  isLoading,
  isRefreshing = false,
}: ProposalListProps) {
  if (isLoading) {
    return (
      <SkeletonRegion label="Carregando propostas…">
        <Row as="ul" className="gap-y-6">
          {Array.from({ length: 6 }, (_, index) => (
            <Col as="li" key={index} sm={6} xl={4}>
              <ProposalCardSkeleton />
            </Col>
          ))}
        </Row>
      </SkeletonRegion>
    );
  }

  if (!proposals?.length) {
    return (
      <EmptyState
        icon={FileText}
        title="Nenhuma proposta encontrada"
        description="As propostas emitidas, do funil e avulsas, aparecem aqui."
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
      {proposals.map((item) => (
        <Col as="li" key={item.id} sm={6} xl={4}>
          <ProposalCard proposal={item} />
        </Col>
      ))}
    </Row>
  );
}
