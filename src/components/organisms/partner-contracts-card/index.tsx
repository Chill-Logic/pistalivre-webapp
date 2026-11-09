import { ChevronRight, FileText, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import { PartnerContractStatusBadge } from "@/components/molecules/partner-contract-status-badge";
import { PartnerContractDialog } from "@/components/organisms/partner-contract-dialog";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { contractTerms, currentVehicles } from "@/helpers/partner";
import { useLabels } from "@/hooks/ui/useLabels";
import type { PartnerContract } from "@/types/partner";
import { formatCalendarDate } from "@/utils/format";
import { pluralize } from "@/utils/text";

type PartnerContractsCardProps = {
  partnerId: string;
  contracts: PartnerContract[];
};

/** The partner's contracts, newest first; each opens its own page. */
export function PartnerContractsCard({
  partnerId,
  contracts,
}: PartnerContractsCardProps) {
  const navigate = useNavigate();
  const { label } = useLabels();

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">
          Contratos
          {contracts.length > 0 && (
            <Text inline size="sm" tone="muted" weight="normal">
              {" "}
              ({contracts.length})
            </Text>
          )}
        </CardTitle>
        <PartnerContractDialog
          partnerId={partnerId}
          onCreated={(contract) => navigate(routeTo.partnerContract(contract.id))}
          trigger={
            <Button size="sm">
              <Plus />
              Novo contrato
            </Button>
          }
        />
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum contrato"
            description="Crie o contrato, inclua as motos e ative."
          />
        ) : (
          <List className="-mx-2 divide-y">
            {contracts.map((contract) => {
              const motos = currentVehicles(contract).length;
              const left = contract.vehicles.length - motos;
              return (
                <ListItem key={contract.id}>
                  <Link
                    to={routeTo.partnerContract(contract.id)}
                    className="flex items-center gap-3 rounded-md px-2 py-3 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-accent"
                  >
                    <Box className="min-w-0 flex-1 space-y-1">
                      <Box className="flex flex-wrap items-center gap-2">
                        <Text weight="semibold" mono>
                          {contract.code}
                        </Text>
                        <Text inline size="xs" tone="muted">
                          {label(LABEL_MAPS.partnerContractType, contract.type)}
                        </Text>
                        <PartnerContractStatusBadge status={contract.status} />
                      </Box>
                      <Text size="sm">
                        {contractTerms(contract, (code) =>
                          label(LABEL_MAPS.partnerShareBase, code),
                        )}
                      </Text>
                      <Text size="xs" tone="muted">
                        {pluralize(motos, "moto", "motos")}
                        {left > 0 && ` (+${left} que saíram)`} · desde{" "}
                        {formatCalendarDate(contract.startDate)}
                        {contract.endDate &&
                          ` até ${formatCalendarDate(contract.endDate)}`}
                      </Text>
                    </Box>
                    <ChevronRight
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  </Link>
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

export function PartnerContractsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <Skeleton shape="text" className="w-24 text-base" />
        <Skeleton className="h-11 w-36 md:h-8" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[0, 1].map((index) => (
          <Box key={index} className="space-y-2">
            <Skeleton shape="text" className="w-48 text-sm" />
            <Skeleton shape="text" className="w-56 text-sm" />
            <Skeleton shape="text" className="w-40 text-xs" />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
