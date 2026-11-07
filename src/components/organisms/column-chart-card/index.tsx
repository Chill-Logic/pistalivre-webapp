import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import {
  ColumnChart,
  ColumnChartSkeleton,
} from "@/components/molecules/column-chart";
import type { ChartSeries, ColumnGroup } from "@/types/chart";

type ColumnChartCardProps = {
  title: string;
  groups: ColumnGroup[];
  series: ChartSeries[];
  format: (value: number) => string;
};

export function ColumnChartCard({
  title,
  groups,
  series,
  format,
}: ColumnChartCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ColumnChart groups={groups} series={series} format={format} />
      </CardContent>
    </Card>
  );
}

export function ColumnChartCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Skeleton shape="text" className="w-48 text-base" />
      </CardHeader>
      <CardContent>
        <ColumnChartSkeleton />
      </CardContent>
    </Card>
  );
}
