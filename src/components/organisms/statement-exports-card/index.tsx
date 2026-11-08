import { Badge } from "@/components/atoms/badge";
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
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  StatementExportItem,
  StatementExportItemSkeleton,
} from "@/components/molecules/statement-export-item";
import { QueryError } from "@/components/organisms/query-error";
import { StatementExportActions } from "@/components/organisms/statement-export-actions";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useStatementExports } from "@/hooks/api/gestao/finance/useStatementExports";
import { useLabels } from "@/hooks/ui/useLabels";
import {
  formatCalendarDate,
  formatDateTime,
  formatFileSize,
} from "@/utils/format";

const SKELETON_ROWS = 3;
const HEADERS = [
  "Conta",
  "Período",
  "Exportado em",
  "Lançamentos",
  "Tamanho",
  "",
];
const RIGHT = new Set(["Lançamentos", "Tamanho"]);

function ExportsTableHead() {
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        {HEADERS.map((header, index) => (
          <TableHead
            key={header || index}
            className={RIGHT.has(header) ? "text-right" : ""}
          >
            {header}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}

/**
 * Every spreadsheet generated stays saved: downloading again gives the SAME
 * file, not a new query to the bank.
 */
export function StatementExportsCard() {
  const exports = useStatementExports();
  const { label } = useLabels();
  const items = exports.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Exportações</CardTitle>
      </CardHeader>
      <CardContent>
        {exports.isPending && (
          <SkeletonRegion label="Carregando exportações…">
            <StatementExportsSkeletonBody />
          </SkeletonRegion>
        )}
        {exports.isError && (
          <QueryError
            error={exports.error}
            onRetry={() => exports.refetch()}
          />
        )}
        {items && items.length === 0 && (
          <Text tone="muted">
            Nenhuma exportação ainda. Use “Exportar planilha” para gerar a
            primeira.
          </Text>
        )}
        {items && items.length > 0 && (
          <>
            <List className="divide-y md:hidden">
              {items.map((item) => (
                <ListItem key={item.id}>
                  <StatementExportItem
                    item={item}
                    actions={<StatementExportActions item={item} />}
                  />
                </ListItem>
              ))}
            </List>
            <Box className="hidden md:block">
              <Table>
                <ExportsTableHead />
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="neutral">
                          {label(LABEL_MAPS.statementSource, item.source)}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatCalendarDate(item.startDate)} a{" "}
                        {formatCalendarDate(item.endDate)}
                        <Text
                          size="xs"
                          tone="muted"
                          className="max-w-64 truncate"
                          title={item.fileName}
                        >
                          {item.fileName}
                        </Text>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(item.exportedAt)}
                        <Text size="xs" tone="muted">
                          {item.createdByName
                            ? `por ${item.createdByName}`
                            : "autor não registrado"}
                        </Text>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.rowCount}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right tabular-nums text-muted-foreground">
                        {formatFileSize(item.size)}
                      </TableCell>
                      <TableCell>
                        <Box className="flex items-center justify-end gap-1">
                          <StatementExportActions item={item} compact />
                        </Box>
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

function StatementExportsSkeletonBody() {
  return (
    <>
      <Box className="divide-y md:hidden">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <StatementExportItemSkeleton key={index} />
        ))}
      </Box>
      <Box className="hidden md:block">
        <Table>
          <ExportsTableHead />
          <TableBody>
            {Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                <TableCell>
                  <Skeleton shape="pill" className="h-5 w-14" />
                </TableCell>
                <TableCell>
                  <Skeleton shape="text" className="w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton shape="text" className="w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton shape="text" className="ml-auto w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton shape="text" className="ml-auto w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto h-9 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </>
  );
}
