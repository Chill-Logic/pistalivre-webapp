import { CloudOff } from "lucide-react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Text } from "@/components/atoms/text";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  AsaasOnlyCustomers,
  AsaasOnlyCustomersSkeleton,
} from "@/components/organisms/asaas-only-customers";
import { AsaasReconcilableAlert } from "@/components/organisms/asaas-reconcilable-alert";
import { errorMessage } from "@/helpers/api-error";
import type { useAsaasDirectory } from "@/hooks/api/gestao/customers/useAsaasDirectory";

type CustomersAsaasPanelProps = {
  directory: ReturnType<typeof useAsaasDirectory>;
};

/**
 * What Asaas says about the customer base, above the list: who can be linked
 * by CPF and who is only there. Asaas down is a quiet note, never a broken
 * list.
 */
export function CustomersAsaasPanel({ directory }: CustomersAsaasPanelProps) {
  if (directory.isPending) {
    return (
      <SkeletonRegion label="Consultando o Asaas…">
        <AsaasOnlyCustomersSkeleton />
      </SkeletonRegion>
    );
  }

  const { data } = directory;
  const error = data ? data.error : errorMessage(directory.error);

  if (!data || error) {
    return (
      <Alert variant="info" role="status" className="flex items-start gap-2">
        <CloudOff className="mt-0.5 size-4 shrink-0" aria-hidden />
        <Text inline size={null}>
          Não foi possível consultar o Asaas agora ({error}). A lista segue
          normal, sem o vínculo por CPF e os clientes só de lá.
        </Text>
      </Alert>
    );
  }

  const { reconcilable, asaasOnly } = data;
  if (reconcilable.length === 0 && asaasOnly.length === 0) return null;

  return (
    <Box className="space-y-4">
      <AsaasReconcilableAlert matches={reconcilable} />
      <AsaasOnlyCustomers customers={asaasOnly} />
    </Box>
  );
}
