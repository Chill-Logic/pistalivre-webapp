import { z } from "zod";
import type { LeadInput } from "@/types/crm";
import { onlyDigits } from "@/utils/masks";

/** Mirrors POST /crm/leads (same PT messages as the API). */
export const leadFormSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome"),
  phone: z
    .string()
    .refine((value) => onlyDigits(value).length >= 10, "Informe um telefone válido com DDD"),
  email: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "E-mail inválido",
    ),
  desiredVehicle: z.string().trim(),
  origin: z.string().min(1, "Escolha a origem do lead"),
  note: z.string().trim(),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

/** Fields the API may report back by name (422 `fields`). */
export const LEAD_FORM_FIELDS = [
  "name",
  "phone",
  "email",
  "desiredVehicle",
  "origin",
  "note",
] as const;

export const leadFormDefaults: LeadFormValues = {
  name: "",
  phone: "",
  email: "",
  desiredVehicle: "",
  origin: "",
  note: "",
};

export function toLeadInput(values: LeadFormValues): LeadInput {
  return {
    name: values.name,
    phone: onlyDigits(values.phone),
    email: values.email || null,
    desiredVehicle: values.desiredVehicle || null,
    origin: values.origin,
    note: values.note || null,
  };
}
