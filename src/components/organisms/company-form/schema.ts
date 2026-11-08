import { z } from "zod";
import type { Company, CompanyInput } from "@/types/company";
import { isValidCnpj, normalizeCnpj } from "@/utils/cnpj";
import { maskCep, maskCnpj, maskPhone, onlyDigits } from "@/utils/masks";

const optional = (max: number) => z.string().trim().max(max);
const isPhone = (value: string) =>
  !value || [10, 11].includes(onlyDigits(value).length);

/** Mirrors the API's rules (same PT messages). */
export const companyFormSchema = z.object({
  document: z.string().refine(isValidCnpj, "CNPJ inválido"),
  legalName: z.string().trim().min(1, "Informe a razão social").max(200),
  tradeName: z.string().trim().min(1, "Informe o nome fantasia").max(200),
  representative: optional(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .refine(
      (value) => !value || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value),
      "E-mail inválido",
    ),
  phone: z.string().refine(isPhone, "Telefone inválido"),
  whatsapp: z.string().refine(isPhone, "WhatsApp inválido"),
  zip: optional(12),
  addressLine: optional(200),
  addressNumber: optional(20),
  complement: optional(120),
  neighborhood: optional(120),
  city: optional(80),
  state: optional(40),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;

/** Fields the API may report back by name (422 `fields`). */
export const COMPANY_FORM_FIELDS = Object.keys(
  companyFormSchema.shape,
) as (keyof CompanyFormValues)[];

/**
 * The domain errors come as a message only ("CNPJ inválido"): the keyword
 * says which field it belongs to.
 */
export const COMPANY_MESSAGE_FIELDS: Record<string, keyof CompanyFormValues> =
  {
    cnpj: "document",
    "razão social": "legalName",
    "nome fantasia": "tradeName",
  };

/** Stored WhatsApp has the country code (55…): the form shows the local one. */
function localWhatsapp(value: string | null) {
  const digits = onlyDigits(value ?? "");
  return digits.startsWith("55") && digits.length >= 12
    ? digits.slice(2)
    : digits;
}

export function companyFormDefaults(company: Company): CompanyFormValues {
  const address = company.address;
  return {
    document: maskCnpj(company.document),
    legalName: company.legalName,
    tradeName: company.tradeName ?? "",
    representative: company.representative ?? "",
    email: company.email ?? "",
    phone: maskPhone(company.phone ?? ""),
    whatsapp: maskPhone(localWhatsapp(company.whatsapp)),
    zip: maskCep(address.zip ?? ""),
    addressLine: address.line ?? "",
    addressNumber: address.number ?? "",
    complement: address.complement ?? "",
    neighborhood: address.neighborhood ?? "",
    city: address.city ?? "",
    state: address.state ?? "",
  };
}

const orNull = (value: string) => value.trim() || null;

export function toCompanyInput(values: CompanyFormValues): CompanyInput {
  return {
    document: normalizeCnpj(values.document),
    legalName: values.legalName.trim(),
    tradeName: values.tradeName.trim(),
    representative: orNull(values.representative),
    email: orNull(values.email),
    phone: orNull(values.phone),
    whatsapp: orNull(onlyDigits(values.whatsapp)),
    address: {
      line: orNull(values.addressLine),
      number: orNull(values.addressNumber),
      complement: orNull(values.complement),
      neighborhood: orNull(values.neighborhood),
      city: orNull(values.city),
      state: orNull(values.state.toUpperCase()),
      zip: orNull(values.zip),
    },
  };
}
