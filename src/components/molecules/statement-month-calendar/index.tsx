import { Box } from "@/components/atoms/box";
import { Heading } from "@/components/atoms/heading";
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
  STATEMENT_CLOSES,
  STATEMENT_DAY_CLASS,
  STATEMENT_DAY_MARK,
  STATEMENT_WEEKDAYS,
} from "@/constants/rent-statement";
import type { StatementMonth } from "@/helpers/rent-statement";
import type { StatementDay } from "@/types/rent-statement";
import { cn } from "@/utils/cn";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

/** Hover/long-press text of a day: what is missing, when it was paid, why it is off. */
function dayTitle(day: StatementDay) {
  const status =
    day.state === "PARTIAL" || day.state === "OPEN"
      ? `Falta ${formatCurrency(day.missing)}`
      : day.state === "PAID" && day.paidOn
        ? `Pago em ${formatCalendarDate(day.paidOn)}`
        : day.reason;
  const closing = day.closesCycle ? STATEMENT_CLOSES[day.closesCycle] : null;
  return [status, closing].filter(Boolean).join(" · ") || undefined;
}

/**
 * One month of the statement as a 7-column calendar table (Sunday first),
 * with the PDF's marks and colors; the day that closes a cycle gets a
 * strong outline so the cycle has an edge.
 */
export function StatementMonthCalendar({ month }: { month: StatementMonth }) {
  return (
    <Box className="space-y-2">
      <Heading
        level={3}
        variant="section"
        className="text-sm uppercase tracking-wide"
      >
        {month.title}
      </Heading>
      <Table className="table-fixed border-separate border-spacing-1">
        <TableHeader>
          <TableRow className="border-0 hover:bg-transparent">
            {STATEMENT_WEEKDAYS.map((weekday, index) => (
              <TableHead
                key={index}
                className="h-6 p-0 text-center text-xs font-normal text-muted-foreground"
              >
                {weekday}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {month.weeks.map((week, row) => (
            <TableRow key={row} className="border-0 hover:bg-transparent">
              {week.map((cell, column) => {
                if (cell === null || typeof cell === "number") {
                  return <TableCell key={column} className="p-0" />;
                }
                const closing = cell.closesCycle
                  ? STATEMENT_CLOSES[cell.closesCycle]
                  : null;
                return (
                  <TableCell
                    key={column}
                    title={dayTitle(cell)}
                    className={cn(
                      "h-12 rounded-md p-0.5 text-center align-middle",
                      STATEMENT_DAY_CLASS[cell.state],
                      closing && "ring-2 ring-inset ring-foreground/80",
                    )}
                  >
                    <Text size="sm" weight="semibold">
                      {Number(cell.date.slice(8, 10))}
                    </Text>
                    {cell.state === "WAIVED" && cell.reason ? (
                      <Text
                        size={null}
                        className="line-clamp-2 break-words text-[10px] leading-tight"
                      >
                        {cell.reason}
                      </Text>
                    ) : (
                      <Text size="sm" className="leading-none">
                        {STATEMENT_DAY_MARK[cell.state]}
                      </Text>
                    )}
                    {/* On the phone the outline alone marks it (the legend says what it is). */}
                    {closing && (
                      <Text
                        size={null}
                        weight="bold"
                        className="hidden text-[9px] leading-tight sm:block"
                      >
                        {closing}
                      </Text>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
