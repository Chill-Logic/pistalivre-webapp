import { Bike } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import {
  PartnerAreaContractCard,
  PartnerAreaContractCardSkeleton,
} from "@/components/organisms/partner-area-contract-card";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { usePartnerHome } from "@/hooks/api/parceiro/area/usePartnerHome";

/**
 * Partner home: each contract (terms) with its motorcycles and who is renting
 * each one now. Read only; what shows is decided on the server.
 */
export function PartnerHomePage() {
  const home = usePartnerHome();

  return (
    <Box className="space-y-6">
      <PageHeader title="Meus contratos" />
      <QueryBoundary
        query={home}
        label="Carregando contratos…"
        skeleton={<PartnerAreaContractCardSkeleton />}
      >
        {({ contracts }) =>
          contracts.length === 0 ? (
            <EmptyState
              icon={Bike}
              title="Nenhum contrato ainda"
              description="Quando a locadora ativar o seu contrato, as suas motos aparecem aqui."
            />
          ) : (
            <Box
              className={
                home.isRefetching
                  ? "space-y-6 opacity-60 transition-opacity"
                  : "space-y-6 transition-opacity"
              }
            >
              {contracts.map((contract) => (
                <PartnerAreaContractCard key={contract.id} contract={contract} />
              ))}
            </Box>
          )
        }
      </QueryBoundary>
    </Box>
  );
}
