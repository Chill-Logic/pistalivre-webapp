import { BriefcaseBusiness } from "lucide-react";
import { Col, Row } from "@/components/atoms/grid";
import { EmptyState } from "@/components/molecules/empty-state";
import {
  PartnerCard,
  PartnerCardSkeleton,
} from "@/components/molecules/partner-card";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import type { PartnerListRow } from "@/types/partner";
import { cn } from "@/utils/cn";

type PartnerListProps = {
  partners: PartnerListRow[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
};

export function PartnersEmpty() {
  return (
    <EmptyState
      icon={BriefcaseBusiness}
      title="Nenhum parceiro encontrado"
      description="Investidores e donos de motos geridas pela empresa aparecem aqui."
    />
  );
}

export function PartnerList({
  partners,
  isLoading,
  isRefreshing = false,
}: PartnerListProps) {
  if (isLoading) {
    return (
      <SkeletonRegion label="Carregando parceiros…">
        <Row as="ul" className="gap-y-6">
          {Array.from({ length: 6 }, (_, index) => (
            <Col as="li" key={index} sm={6} xl={4}>
              <PartnerCardSkeleton />
            </Col>
          ))}
        </Row>
      </SkeletonRegion>
    );
  }

  if (!partners?.length) return <PartnersEmpty />;

  return (
    <Row
      as="ul"
      aria-busy={isRefreshing}
      className={cn(
        "gap-y-6 transition-opacity duration-200",
        isRefreshing && "pointer-events-none opacity-60",
      )}
    >
      {partners.map((partner) => (
        <Col as="li" key={partner.id} sm={6} xl={4}>
          <PartnerCard partner={partner} />
        </Col>
      ))}
    </Row>
  );
}
