import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/atoms/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/atoms/table";
import { Text } from "@/components/atoms/text";
import { PageSizeSelect } from "@/components/molecules/page-size-select";
import { Pagination } from "@/components/molecules/pagination";
import { ViewToggle } from "@/components/molecules/view-toggle";
import { AiActionReviewCard } from "@/components/organisms/ai-action-review-card";
import { DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import {
  AI_ACTION_STATUS,
  aiActionAmount,
  aiActionChannel,
  aiActionSummary,
  formatAiActionWhen,
} from "@/helpers/ai-action";
import { useListView } from "@/hooks/ui/useListView";
import type { AiActionItem } from "@/types/ai";

const when = (action: AiActionItem) => formatAiActionWhen(action.decidedAt ?? action.expiresAt);

/**
 * What the AI proposed and was already decided (done, failed, cancelled,
 * expired): one line each — a paginated table on the desktop, compact rows
 * on the phone (10 at a time). A line opens the full card (details and
 * receipts) in a dialog. At most 30 from the API, so paging is local.
 */
export function AiActionHistory({ actions }: { actions: AiActionItem[] }) {
  const { view, setView, isDesktop } = useListView();
  const [opened, setOpened] = useState<AiActionItem | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [shown, setShown] = useState(DEFAULT_PAGE_SIZE);
  const lastPage = Math.max(1, Math.ceil(actions.length / pageSize));
  const current = Math.min(page, lastPage);
  const visible = isDesktop
    ? actions.slice((current - 1) * pageSize, current * pageSize)
    : actions.slice(0, shown);

  return (
    <Box className="space-y-3">
      <Box className="flex items-center justify-between gap-2">
        <Text size="sm" tone="muted">
          {actions.length} {actions.length === 1 ? "ação" : "ações"}
        </Text>
        <ViewToggle view={view} onChange={setView} />
      </Box>

      {view === "tabela" ? (
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Situação</TableHead>
                <TableHead className="w-full">Ação</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="whitespace-nowrap">Decidida em</TableHead>
                <TableHead className="w-12">
                  <Text inline size={null} className="sr-only">
                    Detalhes
                  </Text>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((action) => {
                const status = AI_ACTION_STATUS[action.status];
                return (
                  <TableRow key={action.id} className="cursor-pointer" onClick={() => setOpened(action)}>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    {/* w-full + max-w-0: takes the room left and truncates inside it. */}
                    <TableCell className="w-full max-w-0">
                      <Text inline size={null} className="block truncate">
                        {aiActionSummary(action)}
                      </Text>
                      <Text inline size="xs" tone="muted" className="block truncate">
                        {action.toolTitle} · {aiActionChannel(action)}
                      </Text>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right tabular-nums">
                      {aiActionAmount(action)?.[1] ?? "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">{when(action)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Ver detalhes: ${aiActionSummary(action)}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpened(action);
                        }}
                      >
                        <ChevronRight />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="divide-y overflow-hidden">
          {visible.map((action) => {
            const status = AI_ACTION_STATUS[action.status];
            const amount = aiActionAmount(action);
            return (
              <Button
                key={action.id}
                variant="ghost"
                className="flex h-auto w-full items-start justify-between gap-3 whitespace-normal rounded-none px-4 py-3 text-left font-normal md:h-auto"
                onClick={() => setOpened(action)}
              >
                <Box className="min-w-0 flex-1 space-y-1">
                  <Box className="flex flex-wrap items-center gap-2">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <Text inline size="xs" tone="muted">
                      {when(action)}
                    </Text>
                  </Box>
                  <Text size="sm" className="line-clamp-2">
                    {aiActionSummary(action)}
                  </Text>
                </Box>
                {amount && (
                  <Text inline size="sm" weight="medium" className="shrink-0 tabular-nums">
                    {amount[1]}
                  </Text>
                )}
              </Button>
            );
          })}
        </Card>
      )}

      {!isDesktop && actions.length > shown && (
        <Button variant="outline" className="w-full" onClick={() => setShown((n) => n + DEFAULT_PAGE_SIZE)}>
          Mostrar mais ({actions.length - shown})
        </Button>
      )}

      {isDesktop && actions.length > DEFAULT_PAGE_SIZE && (
        <Box className="flex flex-wrap items-center justify-between gap-4">
          <Box className="min-w-0 flex-1">
            <Pagination page={current} pageSize={pageSize} total={actions.length} onPageChange={setPage} />
          </Box>
          <PageSizeSelect
            value={pageSize}
            onChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </Box>
      )}

      <Dialog open={opened !== null} onOpenChange={(open) => !open && setOpened(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-0 bg-transparent p-0 shadow-none sm:max-w-4xl sm:p-0">
          <DialogTitle className="sr-only">{opened ? aiActionSummary(opened) : "Detalhes da ação"}</DialogTitle>
          {opened && <AiActionReviewCard action={opened} />}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
