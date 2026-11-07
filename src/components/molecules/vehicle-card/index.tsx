import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Card } from "@/components/atoms/card";
import { VehicleStatusBadge } from "@/components/molecules/vehicle-status-badge";
import { routeTo } from "@/constants/routes";
import { effectiveVehicleStatus, vehicleName } from "@/helpers/vehicle";
import type { Vehicle } from "@/types/vehicle";
import { formatMileage } from "@/utils/format";
import { formatPlate } from "@/utils/plate";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const location = useLocation();
  const details = [
    vehicle.type.name,
    vehicle.category.name,
    vehicle.year,
    vehicle.currentMileage !== null && formatMileage(vehicle.currentMileage),
  ].filter(Boolean);

  return (
    <Link
      to={routeTo.vehicle(vehicle.id)}
      state={{ from: location.pathname + location.search }}
      className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="flex h-full items-center gap-3 p-4 transition-colors hover:bg-accent/50 active:bg-accent">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-mono text-lg font-semibold tracking-wide">
              {formatPlate(vehicle.plate)}
            </p>
            <VehicleStatusBadge status={effectiveVehicleStatus(vehicle)} />
          </div>
          <p className="truncate text-sm">{vehicleName(vehicle)}</p>
          <p className="truncate text-xs text-muted-foreground">
            {details.join(" · ")}
          </p>
          {vehicle.activeRental && (
            <p className="truncate text-xs text-muted-foreground">
              Com{" "}
              <span className="font-medium text-foreground">
                {vehicle.activeRental.customer.name}
              </span>{" "}
              · {vehicle.activeRental.code}
            </p>
          )}
        </div>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </Card>
    </Link>
  );
}
