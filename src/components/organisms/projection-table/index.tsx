import { Minus, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { Text } from "@/components/atoms/text";
import { MoneyInput } from "@/components/molecules/money-input";
import type { ProjectionLine, ProjectionRow } from "@/types/projection";
import { formatCurrency } from "@/utils/format";

type Editable = Pick<
  ProjectionRow,
  "active" | "rent" | "maint" | "suppliers" | "finance" | "financeMonths"
>;

export type ProjectionTableRow = {
  key: string;
  /** Model + plate, or the editable name of a hypothetical vehicle. */
  name: ReactNode;
  /** Accessible name of the row's inputs ("Aluguel semanal de PLA-1001"). */
  label: string;
  values: Editable;
  onChange: (next: Partial<Editable>) => void;
  /** The API's result for this vehicle (absent until computed). */
  line?: ProjectionLine;
  /** Hypothetical vehicles only. */
  qty?: { value: number; onChange: (qty: number) => void };
  onRemove?: () => void;
};

type ProjectionTableProps = {
  rows: ProjectionTableRow[];
  /** Scenario totals, for the share of revenue/costs/maintenance. */
  totals: { revenue: number; costs: number; maintenance: number };
  /** Quantity and remove columns (vehicles to acquire). */
  planning?: boolean;
};

const share = (part: number, whole: number) =>
  whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—";

/**
 * The scenario's vehicles in one dense, editable table (desktop) — the
 * management app's layout: inputs per row, result and share on the right.
 */
export function ProjectionTable({
  rows,
  totals,
  planning,
}: ProjectionTableProps) {
  const money = (value: number | null) => value ?? 0;

  return (
    <Table className="[&_td]:px-2 [&_th]:px-2">
      <TableHeader>
        <TableRow>
          <TableHead>{planning ? "Nome" : "Veículo"}</TableHead>
          <TableHead className="text-center">Alug.?</TableHead>
          <TableHead className="text-right">Aluguel sem.</TableHead>
          <TableHead className="text-right">Manut./mês</TableHead>
          <TableHead className="text-right">Fornec./mês</TableHead>
          <TableHead className="text-right">Financ./mês</TableHead>
          {planning && <TableHead className="text-center">Qtd.</TableHead>}
          <TableHead className="text-right">Faturamento</TableHead>
          <TableHead className="text-right">Lucro (margem)</TableHead>
          <TableHead>Participação</TableHead>
          {planning && <TableHead />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const { values, line } = row;
          return (
            <TableRow key={row.key}>
              <TableCell>{row.name}</TableCell>
              <TableCell className="text-center">
                <Checkbox
                  aria-label={`Alugado: ${row.label}`}
                  checked={values.active}
                  onCheckedChange={(checked) =>
                    row.onChange({ active: checked === true })
                  }
                />
              </TableCell>
              <TableCell className="text-right">
                <MoneyInput
                  label={`Aluguel semanal: ${row.label}`}
                  value={values.rent}
                  onChange={(rent) => row.onChange({ rent: money(rent) })}
                  className="ml-auto"
                />
              </TableCell>
              <TableCell className="text-right">
                <MoneyInput
                  label={`Manutenção mensal: ${row.label}`}
                  value={values.maint}
                  onChange={(maint) => row.onChange({ maint: money(maint) })}
                  className="ml-auto"
                />
              </TableCell>
              <TableCell className="text-right">
                <MoneyInput
                  label={`Custos fixos por mês: ${row.label}`}
                  value={values.suppliers}
                  onChange={(suppliers) =>
                    row.onChange({ suppliers: money(suppliers) })
                  }
                  className="ml-auto"
                />
              </TableCell>
              <TableCell className="text-right">
                <MoneyInput
                  label={`Financiamento por mês: ${row.label}`}
                  value={values.finance}
                  onChange={(finance) =>
                    row.onChange({ finance: money(finance) })
                  }
                  className="ml-auto"
                />
                {/* The term comes from the installment plan: saying how many
                    are left avoids reading it as running forever. */}
                {values.finance > 0 && values.financeMonths != null && (
                  <Text size="xs" tone="muted" className="mt-1">
                    {Math.round(values.financeMonths)}x restante(s)
                  </Text>
                )}
              </TableCell>
              {planning && row.qty && (
                <TableCell>
                  <Box className="flex items-center justify-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 md:h-7 md:w-7"
                      aria-label="Menos"
                      disabled={row.qty.value <= 1}
                      onClick={() => row.qty?.onChange(row.qty.value - 1)}
                    >
                      <Minus />
                    </Button>
                    <Text inline className="w-6 text-center tabular-nums">
                      {row.qty.value}
                    </Text>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 md:h-7 md:w-7"
                      aria-label="Mais"
                      onClick={() => row.qty?.onChange(row.qty.value + 1)}
                    >
                      <Plus />
                    </Button>
                  </Box>
                </TableCell>
              )}
              <TableCell className="text-right tabular-nums">
                {line ? formatCurrency(line.revenue) : "—"}
              </TableCell>
              <TableCell className="text-right">
                <Text
                  weight="semibold"
                  tone={line && line.result < 0 ? "destructive" : "success"}
                  className="tabular-nums"
                >
                  {line ? formatCurrency(line.result) : "—"}
                </Text>
                <Text size="xs" tone="muted">
                  {line && line.revenue > 0
                    ? share(line.result, line.revenue)
                    : "—"}
                </Text>
              </TableCell>
              <TableCell>
                <Text size="xs" tone="muted">
                  {line
                    ? `Fat ${share(line.revenue, totals.revenue)} · Desp ${share(line.cost, totals.costs)} · Man ${share(line.maintenance, totals.maintenance)}`
                    : "—"}
                </Text>
              </TableCell>
              {planning && (
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Remover ${row.label}`}
                    onClick={row.onRemove}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
