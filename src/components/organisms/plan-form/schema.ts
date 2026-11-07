import { z } from "zod";
import type { Plan, PlanInput } from "@/types/plan";
import type { RatePeriod } from "@/types/rental";

const wholeNumber = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .refine((value) => {
      if (!value) return true;
      const n = Number(value);
      return Number.isInteger(n) && n >= min && n <= max;
    }, message);

/** Mirrors the API's planSchema (same PT messages). */
export const planFormSchema = z.object({
  name: z.string().trim().min(2, "Dê um nome ao plano").max(80),
  description: z.string().trim().max(240, "Até 240 caracteres"),
  rate: z
    .number({ invalid_type_error: "Informe o valor do plano" })
    .nullable()
    .refine((value) => value !== null && value > 0, "Informe o valor do plano"),
  ratePeriod: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"], {
    errorMap: () => ({ message: "Periodicidade inválida" }),
  }),
  /** Blank = no fixed term. */
  durationMonths: wholeNumber(1, 120, "Duração inválida (1 a 120 meses)"),
  renewable: z.boolean(),
  noFidelity: z.boolean(),
  ownershipAtEnd: z.boolean(),
  highlights: z
    .array(z.object({ value: z.string().trim().max(160, "Até 160 caracteres") }))
    .max(12, "Até 12 itens"),
  active: z.boolean(),
  sortOrder: wholeNumber(0, 999, "Ordem inválida (0 a 999)"),
});

export type PlanFormInput = z.input<typeof planFormSchema>;
export type PlanFormValues = z.output<typeof planFormSchema>;

/** Fields the API may report back by name (422 `fields`). */
export const PLAN_FORM_FIELDS = [
  "name",
  "description",
  "rate",
  "ratePeriod",
  "durationMonths",
  "highlights",
  "sortOrder",
] as const;

export function planFormDefaults(plan?: Plan): PlanFormInput {
  return {
    name: plan?.name ?? "",
    description: plan?.description ?? "",
    rate: plan?.rate ?? null,
    ratePeriod: (plan?.ratePeriod ?? "WEEKLY") as RatePeriod,
    durationMonths: plan?.durationMonths == null ? "" : String(plan.durationMonths),
    renewable: plan?.renewable ?? false,
    noFidelity: plan?.noFidelity ?? false,
    ownershipAtEnd: plan?.ownershipAtEnd ?? false,
    highlights: (plan?.highlights.length ? plan.highlights : [""]).map(
      (value) => ({ value }),
    ),
    active: plan?.active ?? true,
    sortOrder: String(plan?.sortOrder ?? 0),
  };
}

/** Blank highlight rows are dropped (the API would drop them too). */
export function toPlanInput(values: PlanFormValues): PlanInput {
  return {
    name: values.name,
    description: values.description || null,
    rate: values.rate ?? 0,
    ratePeriod: values.ratePeriod,
    durationMonths: values.durationMonths ? Number(values.durationMonths) : null,
    renewable: values.renewable,
    noFidelity: values.noFidelity,
    ownershipAtEnd: values.ownershipAtEnd,
    highlights: values.highlights.map((h) => h.value).filter(Boolean),
    active: values.active,
    sortOrder: values.sortOrder ? Number(values.sortOrder) : 0,
  };
}
