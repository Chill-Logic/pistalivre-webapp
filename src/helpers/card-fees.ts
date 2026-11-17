import type { CardFeeBand } from "@/types/card-fees";
import { formatCurrency } from "@/utils/format";

const pct = (v: number) =>
  `${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

/** "1×: 2,99% · 2 a 6×: 3,49% · … + R$ 0,49 por parcela". */
export function feeBandsSummary(bands: CardFeeBand[]) {
  const parts = bands.map(
    (b) =>
      `${b.from === b.to ? `${b.from}×` : `${b.from} a ${b.to}×`}: ${pct(b.percent)}`,
  );
  const fixed = bands[0]?.fixedPerInstallment ?? 0;
  return `${parts.join(" · ")}${fixed > 0 ? ` + ${formatCurrency(fixed)} por parcela` : ""}`;
}
