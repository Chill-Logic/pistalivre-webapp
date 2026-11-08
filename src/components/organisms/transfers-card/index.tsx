import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { Text } from "@/components/atoms/text";
import {
  TransferItem,
  TransferItemSkeleton,
} from "@/components/molecules/transfer-item";
import { TransferStatusBadge } from "@/components/molecules/transfer-status-badge";
import { LABEL_MAPS } from "@/constants/label-maps";
import {
  TRANSFER_PURPOSE_LABELS,
  TRANSFER_SOURCE_LABELS,
} from "@/constants/transfer";
import { useLabels } from "@/hooks/ui/useLabels";
import type { Transfer } from "@/types/transfer";
import { formatCurrency, formatDateTime } from "@/utils/format";

const SKELETON_ROWS = 3;
const HEADERS = [
  "Data",
  "Conta de origem",
  "Destino",
  "Descrição",
  "Valor",
  "Situação",
];

/**
 * Pix the platform sent before money-out left the system. Read-only on
 * purpose: nothing here emits, retries or syncs a transfer.
 */
export function TransfersCard({ transfers }: { transfers: Transfer[] }) {
  const { label } = useLabels();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Transferências emitidas</CardTitle>
      </CardHeader>
      <CardContent>
        {transfers.length === 0 ? (
          <Text tone="muted">Nenhuma transferência emitida pelo sistema.</Text>
        ) : (
          <>
            <List className="divide-y md:hidden">
              {transfers.map((transfer) => (
                <ListItem key={transfer.id}>
                  <TransferItem transfer={transfer} />
                </ListItem>
              ))}
            </List>
            <Box className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {HEADERS.map((header) => (
                      <TableHead
                        key={header}
                        className={header === "Valor" ? "text-right" : ""}
                      >
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDateTime(transfer.createdAt)}
                      </TableCell>
                      <TableCell>
                        {TRANSFER_SOURCE_LABELS[transfer.sourceAccount]}
                        <Text size="xs" tone="muted">
                          {TRANSFER_PURPOSE_LABELS[transfer.purpose]}
                        </Text>
                      </TableCell>
                      <TableCell className="min-w-40 whitespace-normal">
                        {transfer.pixOwnerName ?? "Titular não informado"}
                        <Text size="xs" tone="muted">
                          Chave{" "}
                          {label(LABEL_MAPS.pixKeyType, transfer.pixKeyType)}
                          {transfer.customer?.name
                            ? ` · ${transfer.customer.name}`
                            : ""}
                        </Text>
                      </TableCell>
                      <TableCell className="min-w-40 whitespace-normal">
                        {transfer.description}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right font-medium tabular-nums text-destructive">
                        {formatCurrency(-transfer.amount)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <TransferStatusBadge status={transfer.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function TransfersCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-44 text-base" />
      </CardHeader>
      <CardContent>
        <Box className="divide-y md:hidden">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <TransferItemSkeleton key={index} />
          ))}
        </Box>
        <Box className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {HEADERS.map((header) => (
                  <TableHead
                    key={header}
                    className={header === "Valor" ? "text-right" : ""}
                  >
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <TableRow key={index} className="hover:bg-transparent">
                  <TableCell>
                    <Skeleton shape="text" className="w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton shape="text" className="w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton shape="text" className="w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton shape="text" className="w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton shape="text" className="ml-auto w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton shape="pill" className="h-5 w-16" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );
}
