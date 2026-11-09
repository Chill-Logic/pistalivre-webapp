import { Badge } from "@/components/atoms/badge";
import { Skeleton } from "@/components/atoms/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/atoms/table";
import { Text } from "@/components/atoms/text";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { auditChannel, auditEvent, auditWho } from "@/helpers/ai-audit";
import type { AiAuditEntry } from "@/types/ai";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/format";

const HEADERS = ["Quando", "Evento", "Quem", "Canal", "Resultado"];

type AiAuditTableProps = {
  entries: AiAuditEntry[] | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  onOpen: (id: string) => void;
  toolTitle: (name: string) => string;
};

/** The audit on the desktop; a row opens the event in full. */
export function AiAuditTable({ entries, isLoading, isRefreshing, onOpen, toolTitle }: AiAuditTableProps) {
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
      <SkeletonRegion label="Carregando auditoria…">
        <Table>
          {head}
          <TableBody>
            {Array.from({ length: 8 }, (_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                {["w-28", "w-44", "w-32", "w-20"].map((w, c) => (
                  <TableCell key={c}>
                    <Skeleton shape="text" className={w} />
                  </TableCell>
                ))}
                <TableCell>
                  <Skeleton shape="pill" className="h-5 w-16" />
                </TableCell>
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
          <TableRow key={entry.id} className="cursor-pointer" onClick={() => onOpen(entry.id)}>
            <TableCell className="whitespace-nowrap tabular-nums">{formatDateTime(entry.createdAt)}</TableCell>
            <TableCell>
              <Text weight="medium">{auditEvent(entry, toolTitle)}</Text>
              {entry.error && (
                <Text size="xs" tone="muted" className="line-clamp-1">
                  {entry.error}
                </Text>
              )}
            </TableCell>
            <TableCell>{auditWho(entry)}</TableCell>
            <TableCell>{auditChannel(entry)}</TableCell>
            <TableCell>
              <Badge variant={entry.ok ? "success" : "error"}>{entry.ok ? "Sucesso" : "Falha"}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
