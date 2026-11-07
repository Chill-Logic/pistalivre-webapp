import { z } from "zod";
import type {
  MaintenanceDetail,
  MaintenanceInput,
  MaintenanceType,
} from "@/types/maintenance";
import { calendarDay, todayInBrasilia } from "@/utils/date";

export const maintenanceFormSchema = z.object({
  vehicleId: z.string().min(1, "Veículo é obrigatório"),
  vehicleLabel: z.string(),
  rentalId: z.string(),
  type: z.enum(["PREVENTIVE", "CORRECTIVE", "REVISION", "OTHER"]),
  performedAt: z.string().min(1, "Informe a data da manutenção"),
  services: z.array(z.string()),
  serviceDetails: z.record(z.string(), z.string()),
  mileage: z
    .string()
    .regex(/^\d*$/, "Só números")
    .refine((v) => v === "" || Number(v) <= 9_999_999, "Km inválido"),
  cost: z.number().nullable(),
  provider: z.string().max(120),
  description: z.string().max(2000),
});

export type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

/** Fields the API can point at (422 `fields`). */
export const MAINTENANCE_FORM_FIELDS = [
  "vehicleId",
  "rentalId",
  "type",
  "performedAt",
  "mileage",
  "cost",
  "provider",
  "description",
] as const;

export type MaintenanceFormContext = {
  vehicleId?: string;
  vehicleLabel?: string;
  rentalId?: string;
};

export function maintenanceFormDefaults(
  maintenance?: MaintenanceDetail,
  context: MaintenanceFormContext = {},
): MaintenanceFormValues {
  if (maintenance) {
    return {
      vehicleId: maintenance.vehicle.id,
      vehicleLabel: maintenance.vehicle.label,
      rentalId: maintenance.rental?.id ?? "",
      type: maintenance.type,
      performedAt: calendarDay(maintenance.performedAt),
      services: maintenance.services,
      serviceDetails: maintenance.serviceDetails ?? {},
      mileage: maintenance.mileage != null ? String(maintenance.mileage) : "",
      cost: maintenance.cost,
      provider: maintenance.provider ?? "",
      description: maintenance.description ?? "",
    };
  }
  return {
    vehicleId: context.vehicleId ?? "",
    vehicleLabel: context.vehicleLabel ?? "",
    rentalId: context.rentalId ?? "",
    type: "CORRECTIVE" as MaintenanceType,
    performedAt: todayInBrasilia(),
    services: [],
    serviceDetails: {},
    mileage: "",
    cost: null,
    provider: "",
    description: "",
  };
}

/** Form → API body. Specs only for checked services, trimmed. */
export function toMaintenanceInput(
  values: MaintenanceFormValues,
  isNew: boolean,
): MaintenanceInput {
  const serviceDetails = Object.fromEntries(
    values.services
      .map((code) => [code, (values.serviceDetails[code] ?? "").trim()])
      .filter(([, spec]) => spec),
  );
  return {
    ...(isNew
      ? { vehicleId: values.vehicleId, rentalId: values.rentalId || null }
      : {}),
    type: values.type,
    performedAt: values.performedAt,
    services: values.services,
    serviceDetails,
    mileage: values.mileage ? Number(values.mileage) : null,
    cost: values.cost,
    provider: values.provider.trim() || null,
    description: values.description.trim() || null,
  };
}
