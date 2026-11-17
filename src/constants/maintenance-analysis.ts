import type { SelectOption } from "@/helpers/select";
import type {
  AnalysisDimension,
  AnalysisSort,
} from "@/types/maintenance-analysis";

export const ANALYSIS_DIMENSION_OPTIONS: (SelectOption & {
  value: AnalysisDimension;
})[] = [
  { value: "vehicle", label: "Veículo" },
  { value: "model", label: "Modelo" },
  { value: "year", label: "Ano" },
  { value: "owner", label: "Dono (empresa ou parceiro)" },
  { value: "customer", label: "Cliente" },
  { value: "rental", label: "Locação" },
  { value: "month", label: "Mês" },
  { value: "tenure", label: "Tempo de locação" },
  { value: "type", label: "Tipo (preventiva, corretiva…)" },
  { value: "service", label: "Serviço" },
  { value: "provider", label: "Oficina" },
  { value: "payer", label: "Quem pagou" },
];

/** Column header of the group, per dimension. */
export const ANALYSIS_GROUP_HEADER: Record<AnalysisDimension, string> = {
  vehicle: "Veículo",
  model: "Modelo",
  year: "Ano",
  owner: "Dono",
  customer: "Cliente",
  rental: "Locação",
  month: "Mês",
  tenure: "Tempo de locação",
  type: "Tipo",
  service: "Serviço",
  provider: "Oficina",
  payer: "Quem pagou",
};

/** Dimensions with an order of their own (time, buckets): "natural" sort. */
export const ORDERED_DIMENSIONS: ReadonlySet<AnalysisDimension> = new Set([
  "month",
  "tenure",
  "year",
  "payer",
]);

export const ANALYSIS_SORT_OPTIONS: (SelectOption & { value: AnalysisSort })[] =
  [
    { value: "cost", label: "Custo" },
    { value: "costPerVehicleMonth", label: "R$ por veículo-mês" },
    { value: "costPerKm", label: "R$ por km" },
    { value: "revenueShare", label: "% da receita" },
    { value: "count", label: "Manutenções" },
  ];

export const NATURAL_SORT_LABEL: Partial<Record<AnalysisDimension, string>> = {
  month: "Mês a mês",
  tenure: "Tempo de locação",
  year: "Ano",
  payer: "Quem pagou",
};

export const DEFAULT_ANALYSIS_DIMENSION: AnalysisDimension = "vehicle";
