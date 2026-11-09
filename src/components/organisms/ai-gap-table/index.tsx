import { Badge } from "@/components/atoms/badge";
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
import { auditChannel, auditGap, auditWho } from "@/helpers/ai-audit";
import type { AiAuditEntry } from "@/types/ai";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/format";

const HEADERS = ["Quando", "Pergunta", "Motivo", "Quem", "Canal"];

type AiGapTableProps = {
  entries: AiAuditEntry[] | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  onOpen: (id: string) => void;
};

/** The unanswered questions on the desktop; a row opens the event in full. */
export function AiGapTable({
  entries,
  isLoading,
  isRefreshing,
  onOpen,
}: AiGapTableProps) {
  const head = (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        {HEADERS.map((h) => (
          <TableHead key={h}>{h}</TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
  if (isLoading) {
    return (
      <SkeletonRegion label="Carregando perguntas…">
        <Table>
          {head}
          <TableBody>
            {Array.from({ length: 6 }, (_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                <TableCell>
                  <Skeleton shape="text" className="w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton shape="text" className="w-64" />
                </TableCell>
                <TableCell>
                  <Skeleton shape="pill" className="h-5 w-24" />
                </TableCell>
                {["w-32", "w-20"].map((w) => (
                  <TableCell key={w}>
                    <Skeleton shape="text" className={w} />
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
      className={cn(
        "transition-opacity duration-200",
        isRefreshing && "pointer-events-none opacity-60",
      )}
    >
      {head}
      <TableBody>
        {entries?.map((entry) => {
          const gap = auditGap(entry);
          return (
            <TableRow
              key={entry.id}
              className="cursor-pointer"
              onClick={() => onOpen(entry.id)}
            >
              <TableCell className="whitespace-nowrap tabular-nums">
                {formatDateTime(entry.createdAt)}
              </TableCell>
              <TableCell>
                <Text weight="medium" className="line-clamp-2">
                  {gap.question || "—"}
                </Text>
                {gap.detail && (
                  <Text size="xs" tone="muted" className="line-clamp-1">
                    {gap.detail}
                  </Text>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{gap.reason}</Badge>
              </TableCell>
              <TableCell>{auditWho(entry)}</TableCell>
              <TableCell>{auditChannel(entry)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
