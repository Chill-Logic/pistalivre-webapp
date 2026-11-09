import { Car } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Heading } from "@/components/atoms/heading";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import {
  PartnerAreaContractCard,
  PartnerAreaContractCardSkeleton,
} from "@/components/organisms/partner-area-contract-card";
import { PartnerAreaProposalCard } from "@/components/organisms/partner-area-proposal-card";
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
 * Partner home: on top, the proposals the company sent (accept or refuse);
 * then each contract (terms) with its vehicles and who is renting each one
 * now. On the desktop, a strip of indicators (counts only) above the
 * contracts. What shows is decided on the server.
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
        {({ contracts, proposals = [] }) => (
          <Box
            className={
              home.isRefetching
                ? "space-y-6 opacity-60 transition-opacity"
                : "space-y-6 transition-opacity"
            }
          >
            {proposals.length > 0 && (
              <Box className="space-y-3">
                <Heading level={2} variant="section">
                  Propostas
                </Heading>
                {proposals.map((proposal) => (
                  <PartnerAreaProposalCard
                    key={proposal.contractId}
                    proposal={proposal}
                  />
                ))}
              </Box>
            )}
            {proposals.length > 0 && (
              <Heading level={2} variant="section">
                Contratos
              </Heading>
            )}
            {contracts.length === 0 ? (
              proposals.length > 0 ? (
                <Text tone="muted">
                  Depois do aceite e da assinatura, a locadora ativa o contrato
                  e os seus veículos aparecem aqui.
                </Text>
              ) : (
                <EmptyState
                  icon={Car}
                  title="Nenhum contrato ainda"
                  description="Quando a locadora ativar o seu contrato, os seus veículos aparecem aqui."
                />
              )
            ) : (
              <>
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
              </>
            )}
          </Box>
        )}
      </QueryBoundary>
    </Box>
  );
}
