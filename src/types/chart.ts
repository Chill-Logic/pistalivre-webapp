/** One row of a horizontal bar list. */
export type BarItem = {
  key: string;
  label: string;
  value: number;
  /** Text written at the end of the row (e.g. "R$ 1.200,00"). */
  display: string;
  color?: string;
  /** Detail screen the row leads to. */
  to?: string;
};

export type ChartSeries = {
  key: string;
  name: string;
  color: string;
};

/** One group of vertical bars (a month), with a value per series key. */
export type ColumnGroup = {
  key: string;
  label: string;
  values: Record<string, number>;
};
