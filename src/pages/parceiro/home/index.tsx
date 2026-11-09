import { Car } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import {
  PartnerAreaContractCard,
  PartnerAreaContractCardSkeleton,
} from "@/components/organisms/partner-area-contract-card";
import {
  PartnerAreaStats,
  PartnerAreaStatsSkeleton,
} from "@/components/organisms/partner-area-stats";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { WIDE_MEDIA_QUERY } from "@/constants/layout";
import { usePartnerHome } from "@/hooks/api/parceiro/area/usePartnerHome";
import { usePartnerRentals } from "@/hooks/api/parceiro/area/usePartnerRentals";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";

/**
 * Partner home: each contract (terms) with its vehicles and who is renting
 * each one now. On the desktop, a strip of indicators (counts only) on top.
 * Read only; what shows is decided on the server.
 */
export function PartnerHomePage() {
  const home = usePartnerHome();
  const isWide = useMediaQuery(WIDE_MEDIA_QUERY);
  const rentals = usePartnerRentals(isWide);

  return (
    <Box className="space-y-6">
      <PageHeader title="Meus contratos" />
      <QueryBoundary
        query={home}
        label="Carregando contratos…"
        skeleton={
          <Box className="space-y-6">
            <Box className="hidden lg:block">
              <PartnerAreaStatsSkeleton />
            </Box>
            <PartnerAreaContractCardSkeleton />
          </Box>
        }
      >
        {({ contracts }) =>
          contracts.length === 0 ? (
            <EmptyState
              icon={Car}
              title="Nenhum contrato ainda"
              description="Quando a locadora ativar o seu contrato, os seus veículos aparecem aqui."
            />
          ) : (
            <Box
              className={
                home.isRefetching
                  ? "space-y-6 opacity-60 transition-opacity"
                  : "space-y-6 transition-opacity"
              }
            >
              {isWide && (
                <PartnerAreaStats
                  contracts={contracts}
                  rentalCount={
                    rentals.isError
                      ? null
                      : rentals.isPending
                        ? undefined
                        : rentals.rentals.length
                  }
                />
              )}
              {contracts.map((contract) => (
                <PartnerAreaContractCard
                  key={contract.id}
                  contract={contract}
                />
              ))}
            </Box>
          )
        }
      </QueryBoundary>
    </Box>
  );
}
