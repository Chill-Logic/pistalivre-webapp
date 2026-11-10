import { z } from "zod";
import type { VehicleDetail, VehicleInput } from "@/types/vehicle";

const MIN_YEAR = 1900;
const MAX_YEAR = new Date().getFullYear() + 1;
/** Brazilian VIN: 17 chars, alphanumeric without I, O and Q. */
const CHASSIS = /^[A-HJ-NPR-Z0-9]{17}$/;

/** null = the company; "" = "Parceiro" chosen but no partner picked yet. */
const partyField = z
  .string()
  .nullable()
  .refine((value) => value !== "", "Escolha o parceiro");

/** Mirrors the API's createVehicleSchema (same PT messages). */
export const vehicleFormSchema = z.object({
  plate: z
    .string()
    .trim()
    .min(6, "Placa inválida")
    .max(8, "Placa inválida")
    .transform((value) => value.toUpperCase()),
  /** UI only: narrows the categories. */
  typeSlug: z.string(),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  brand: z.string().trim().min(1, "Marca é obrigatória").max(60),
  model: z.string().trim().min(1, "Modelo é obrigatório").max(60),
  year: z
    .string()
    .min(1, "Ano é obrigatório")
    .refine((value) => {
      const year = Number(value);
      return Number.isInteger(year) && year >= MIN_YEAR && year <= MAX_YEAR;
    }, `Ano entre ${MIN_YEAR} e ${MAX_YEAR}`),
  color: z.string().trim().max(30),
  chassis: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .refine((value) => CHASSIS.test(value), "Chassi inválido (17 caracteres)"),
  renavam: z
    .string()
    .trim()
    .refine(
      (value) => /^\d{9,11}$/.test(value),
      "Renavam inválido (9 a 11 dígitos)",
    ),
  titleHolderPartnerId: partyField,
  ownerPartnerId: partyField,
});

export type VehicleFormInput = z.input<typeof vehicleFormSchema>;
export type VehicleFormValues = z.output<typeof vehicleFormSchema>;

/** Fields the API may report back by name (422 `fields`). */
export const VEHICLE_FORM_FIELDS = [
  "plate",
  "categoryId",
  "brand",
  "model",
  "year",
  "color",
  "chassis",
  "renavam",
  "titleHolderPartnerId",
  "ownerPartnerId",
] as const;

/** Who is on the papers when nothing is saved yet (e.g. from a contract). */
export type VehiclePartiesPrefill = {
  titleHolderPartnerId: string | null;
  ownerPartnerId: string | null;
};

export function vehicleFormDefaults(
  vehicle?: VehicleDetail,
  typeSlug = "",
  prefill?: VehiclePartiesPrefill,
): VehicleFormInput {
  return {
    plate: vehicle?.plate ?? "",
    typeSlug,
    categoryId: vehicle?.category.id ?? "",
    brand: vehicle?.brand.name ?? "",
    model: vehicle?.model.name ?? "",
    year: vehicle ? String(vehicle.year) : "",
    color: vehicle?.color ?? "",
    chassis: vehicle?.chassis ?? "",
    renavam: vehicle?.renavam ?? "",
    titleHolderPartnerId: vehicle
      ? (vehicle.titleHolder?.partnerId ?? null)
      : (prefill?.titleHolderPartnerId ?? null),
    ownerPartnerId: vehicle
      ? (vehicle.owner?.partnerId ?? null)
      : (prefill?.ownerPartnerId ?? null),
  };
}

export function toVehicleInput(values: VehicleFormValues): VehicleInput {
  return {
    plate: values.plate,
    brand: values.brand,
    model: values.model,
    year: Number(values.year),
    categoryId: values.categoryId,
    color: values.color || null,
    chassis: values.chassis,
    renavam: values.renavam,
    titleHolderPartnerId: values.titleHolderPartnerId || null,
    ownerPartnerId: values.ownerPartnerId || null,
  };
}
