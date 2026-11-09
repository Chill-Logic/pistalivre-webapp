import { Col, Row } from "@/components/atoms/grid";
import { StatCard, StatCardSkeleton } from "@/components/molecules/stat-card";
import { partnerHomeCounts } from "@/helpers/partner-area";
import type { PartnerAreaContract } from "@/types/partner-area";
import { pluralize } from "@/utils/text";

type PartnerAreaStatsProps = {
  contracts: PartnerAreaContract[];
  /** Rentals the partner follows; undefined while loading, null on error. */
  rentalCount: number | null | undefined;
};

/**
 * The home's indicators (desktop): only counts — no money is added up here.
 */
export function PartnerAreaStats({
  contracts,
  rentalCount,
}: PartnerAreaStatsProps) {
  const counts = partnerHomeCounts(contracts);
  const free = counts.vehiclesInContract - counts.vehiclesRented;

  return (
    <Row className="gap-y-4">
      <Col span={6} lg={3}>
        <StatCard
          label="Contratos ativos"
          value={counts.activeContracts}
          hint={pluralize(
            contracts.length,
            "contrato no total",
            "contratos no total",
          )}
        />
      </Col>
      <Col span={6} lg={3}>
        <StatCard
          label="Veículos no contrato"
          value={counts.vehiclesInContract}
          hint="Nos contratos ativos"
        />
      </Col>
      <Col span={6} lg={3}>
        <StatCard
          label="Veículos alugados agora"
          value={counts.vehiclesRented}
          tone={counts.vehiclesRented > 0 ? "success" : "default"}
          hint={
            free > 0
              ? pluralize(free, "parada", "paradas")
              : counts.vehiclesInContract > 0
                ? "Todas rodando"
                : undefined
          }
        />
      </Col>
      <Col span={6} lg={3}>
        {rentalCount === undefined ? (
          <StatCardSkeleton />
        ) : (
          <StatCard
            label="Locações acompanhadas"
            value={rentalCount ?? "Indisponível"}
            tone={rentalCount === null ? "muted" : "default"}
            hint="Desde que os veículos entraram"
          />
        )}
      </Col>
    </Row>
  );
}

export function PartnerAreaStatsSkeleton() {
  return (
    <Row className="gap-y-4">
      {[0, 1, 2, 3].map((index) => (
        <Col key={index} span={6} lg={3}>
          <StatCardSkeleton />
        </Col>
      ))}
    </Row>
  );
}
