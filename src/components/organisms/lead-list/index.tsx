import { Target } from "lucide-react";
import type { ReactNode } from "react";
import { Col, Row } from "@/components/atoms/grid";
import { EmptyState } from "@/components/molecules/empty-state";
import { LeadCard, LeadCardSkeleton } from "@/components/molecules/lead-card";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { LeadStageSelect } from "@/components/organisms/lead-stage-select";
import type { CrmOptions, LeadListItem } from "@/types/crm";
import { cn } from "@/utils/cn";

type LeadListProps = {
  leads: LeadListItem[] | undefined;
  /** With them, an open lead's stage is changed right on its card. */
  options?: CrmOptions;
  isLoading: boolean;
  isRefreshing?: boolean;
  /** Under the empty state (e.g. "Links de campanha"). */
  emptyAction?: ReactNode;
};

export function LeadList({
  leads,
  options,
  isLoading,
  isRefreshing = false,
  emptyAction,
}: LeadListProps) {
  if (isLoading) {
    return (
      <SkeletonRegion label="Carregando leads…">
        <Row as="ul" className="gap-y-6">
          {Array.from({ length: 6 }, (_, index) => (
            <Col as="li" key={index} sm={6} xl={4}>
              <LeadCardSkeleton withFooter />
            </Col>
          ))}
        </Row>
      </SkeletonRegion>
    );
  }

  if (!leads?.length) {
    return (
      <EmptyState
        icon={Target}
        title="Nenhum lead encontrado"
        description="Ajuste a busca, o estágio ou mostre os leads de teste."
        action={emptyAction}
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
      {leads.map((lead) => (
        <Col as="li" key={lead.id} sm={6} xl={4}>
          <LeadCard
            lead={lead}
            footer={
              options &&
              lead.status !== "WON" &&
              lead.status !== "LOST" && (
                <LeadStageSelect
                  lead={lead}
                  options={options}
                  className="w-full [&>button]:flex-1"
                />
              )
            }
          />
        </Col>
      ))}
    </Row>
  );
}
