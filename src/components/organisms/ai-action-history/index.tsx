import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/atoms/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/atoms/table";
import { Text } from "@/components/atoms/text";
import { ViewToggle } from "@/components/molecules/view-toggle";
import { AiActionReviewCard } from "@/components/organisms/ai-action-review-card";
import { AI_ACTION_STATUS, aiActionAmount, aiActionChannel, aiActionSummary } from "@/helpers/ai-action";
import { useListView } from "@/hooks/ui/useListView";
import type { AiActionItem } from "@/types/ai";
import { formatDateTime } from "@/utils/format";

/** The phone list grows 10 at a time. */
const PAGE = 10;

const when = (action: AiActionItem) => formatDateTime(action.decidedAt ?? action.expiresAt);

/**
 * What the AI proposed and was already decided (done, failed, cancelled,
 * expired): one line each — a table on the desktop, compact rows on the
 * phone. A line opens the full card (details and receipts) in a dialog.
 */
export function AiActionHistory({ actions }: { actions: AiActionItem[] }) {
  const { view, setView, isDesktop } = useListView();
  const [opened, setOpened] = useState<AiActionItem | null>(null);
  const [shown, setShown] = useState(PAGE);
  const visible = isDesktop ? actions : actions.slice(0, shown);

  return (
    <Box className="space-y-3">
      <Box className="flex items-center justify-between gap-2">
        <Text size="sm" tone="muted">
          {actions.length} {actions.length === 1 ? "ação" : "ações"}
        </Text>
        <ViewToggle view={view} onChange={setView} />
      </Box>

      {view === "tabela" ? (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Situação</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Decidida em</TableHead>
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
                    <TableCell className="max-w-xl">
                      <Text inline size={null} className="block truncate">
                        {aiActionSummary(action)}
                      </Text>
                      <Text inline size="xs" tone="muted" className="block truncate">
                        {action.toolTitle}
                      </Text>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{aiActionAmount(action)?.[1] ?? "—"}</TableCell>
                    <TableCell>
                      <Text inline size="xs" tone="muted">
                        {aiActionChannel(action)}
                      </Text>
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
        <Button variant="outline" className="w-full" onClick={() => setShown((n) => n + PAGE)}>
          Mostrar mais ({actions.length - shown})
        </Button>
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
