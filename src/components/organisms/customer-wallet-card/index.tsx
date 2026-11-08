import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CollapsibleCard } from "@/components/molecules/collapsible-card";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { WalletKeyItem } from "@/components/molecules/wallet-key-item";
import { QueryError } from "@/components/organisms/query-error";
import { WalletAddDialog } from "@/components/organisms/wallet-add-dialog";
import { WalletKeyActions } from "@/components/organisms/wallet-key-actions";
import {
  useCustomerWallet,
  useCustomerWalletMutations,
} from "@/hooks/api/gestao/customers/useCustomerWallet";
import type { CustomerDetail } from "@/types/customer";

/**
 * The customer's pix keys, where refunds go. The team registers them for
 * the customer (each one checked in the DICT first): registering a key is
 * not moving money; the system never pays anything out.
 */
export function CustomerWalletCard({
  customer,
}: {
  customer: Pick<CustomerDetail, "id" | "document" | "email" | "phone">;
}) {
  const wallet = useCustomerWallet(customer.id);
  const mutations = useCustomerWalletMutations(customer.id);
  // The default key first: it is where a refund goes when no one picks.
  const items = [...(wallet.data ?? [])].sort(
    (a, b) => Number(b.isDefault) - Number(a.isDefault),
  );

  return (
    <CollapsibleCard
      title="Carteira pix"
      count={wallet.data?.length}
      storageKey="customer-wallet"
      contentClassName="space-y-2"
      actions={
        <WalletAddDialog
          mutations={mutations}
          description="É para ela que vão os reembolsos do cliente. Conferimos no banco de quem é a chave antes de salvar."
          keyFieldLabel="Chave pix"
          askLabel
          prefill={{
            CPF: customer.document,
            EMAIL: customer.email,
            PHONE: customer.phone,
          }}
        />
      }
    >
      {wallet.isPending && (
        <SkeletonRegion label="Carregando carteira…">
          <CustomerWalletRows />
        </SkeletonRegion>
      )}
      {wallet.isError && (
        <QueryError error={wallet.error} onRetry={() => wallet.refetch()} />
      )}
      {wallet.data && items.length === 0 && (
        <Text tone="muted">
          Nenhuma chave pix cadastrada. É para ela que vão os reembolsos.
        </Text>
      )}
      {items.length > 0 && (
        <Box className="divide-y">
          {items.map((walletKey) => (
            <WalletKeyItem
              key={walletKey.id}
              walletKey={walletKey}
              actions={
                <WalletKeyActions walletKey={walletKey} mutations={mutations} />
              }
            />
          ))}
        </Box>
      )}
    </CollapsibleCard>
  );
}

function CustomerWalletRows() {
  return (
    <Box className="divide-y">
      {[0, 1].map((index) => (
        <Box key={index} className="flex items-start gap-3 py-3">
          <Skeleton className="mt-0.5 size-5 shrink-0" />
          <Box className="min-w-0 flex-1 space-y-2">
            <Skeleton shape="text" className="w-40 text-sm" />
            <Skeleton shape="text" className="w-56 text-xs" />
          </Box>
          <Skeleton className="size-8 shrink-0" />
        </Box>
      ))}
    </Box>
  );
}

export function CustomerWalletCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-28 text-base" />
      </CardHeader>
      <CardContent>
        <CustomerWalletRows />
      </CardContent>
    </Card>
  );
}
