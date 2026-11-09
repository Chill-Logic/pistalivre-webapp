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
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { LABEL_MAPS } from "@/constants/label-maps";
import { aiUsageTask, aiUsageTokens } from "@/helpers/ai-usage";
import { useLabels } from "@/hooks/ui/useLabels";
import type { AiUsageEntry } from "@/types/ai-usage";
import { cn } from "@/utils/cn";
import { formatDateTime, formatUsd } from "@/utils/format";

const HEADERS = ["Quando", "Tarefa", "Quem", "Modelo", "Tokens", "Custo"];

type AiUsageTableProps = {
  entries: AiUsageEntry[] | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
};

/** The month's AI calls on the desktop, newest first. */
export function AiUsageTable({ entries, isLoading, isRefreshing }: AiUsageTableProps) {
  const { label } = useLabels();
  const head = (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        {HEADERS.map((header) => (
          <TableHead key={header} className={cn(header === "Custo" && "text-right")}>
            {header}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );

  if (isLoading) {
    return (
      <SkeletonRegion label="Carregando chamadas…">
        <Table>
          {head}
          <TableBody>
            {Array.from({ length: 6 }, (_, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                {["w-28", "w-40", "w-20", "w-36", "w-40", "w-16"].map((width, cell) => (
                  <TableCell key={cell}>
                    <Skeleton shape="text" className={cn(width, cell === 5 && "ml-auto")} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SkeletonRegion>
    );
  }

  return (
    <Table
      aria-busy={isRefreshing}
      className={cn("transition-opacity duration-200", isRefreshing && "pointer-events-none opacity-60")}
    >
      {head}
      <TableBody>
        {entries?.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell className="tabular-nums">
              {formatDateTime(entry.createdAt)}
            </TableCell>
            <TableCell>{aiUsageTask(entry, label)}</TableCell>
            <TableCell>{entry.userName ?? "—"}</TableCell>
            <TableCell>
              <Text size="sm">{entry.model ?? "—"}</Text>
              <Text size="xs" tone="muted">
                {label(LABEL_MAPS.aiProvider, entry.provider)}
              </Text>
            </TableCell>
            <TableCell className="min-w-40 whitespace-normal tabular-nums">
              <Text size="xs" tone="muted">
                {aiUsageTokens(entry)}
              </Text>
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {formatUsd(entry.costUsd)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
