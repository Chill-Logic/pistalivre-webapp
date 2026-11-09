import { z } from "zod";
import type { PartnerDetail, PartnerInput } from "@/types/partner";
import { isValidCnpj, normalizeCnpj } from "@/utils/cnpj";
import { isValidCpf } from "@/utils/cpf";
import { maskCnpj, maskCpf, maskPhone, onlyDigits } from "@/utils/masks";

/** Mirrors the API's partnerSchema (same PT messages). */
export const partnerFormSchema = z
  .object({
    documentType: z.enum(["CPF", "CNPJ"], {
      errorMap: () => ({ message: "Escolha CPF ou CNPJ" }),
    }),
    document: z.string().trim().min(1, "Informe o documento"),
    name: z.string().trim().min(2, "Informe o nome").max(160),
    tradeName: z.string().trim().max(160),
    email: z.string().trim().email("E-mail inválido").max(160),
    phone: z.string(),
    pixKey: z.string().trim().max(140),
    notes: z.string().trim().max(2000),
    active: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const valid =
      values.documentType === "CPF"
        ? isValidCpf(values.document)
        : isValidCnpj(values.document);
    if (values.document && !valid) {
      ctx.addIssue({
        code: "custom",
        path: ["document"],
        message: `${values.documentType} inválido`,
      });
    }
    const phone = onlyDigits(values.phone);
    if (phone && phone.length < 10) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Telefone incompleto",
      });
    }
  });

export type PartnerFormValues = z.infer<typeof partnerFormSchema>;

/** Fields the API may report back by name (409/422 `fields`). */
export const PARTNER_FORM_FIELDS = [
  "documentType",
  "document",
  "name",
  "tradeName",
  "email",
  "phone",
  "pixKey",
  "notes",
  "active",
] as const;

/** The document as typed, masked by its type. */
export function maskPartnerDocument(type: string, value: string) {
  return type === "CNPJ" ? maskCnpj(value) : maskCpf(value);
}

export function partnerFormDefaults(
  partner?: PartnerDetail,
): PartnerFormValues {
  const documentType = partner?.documentType ?? "CPF";
  return {
    documentType,
    document: partner ? maskPartnerDocument(documentType, partner.document) : "",
    name: partner?.name ?? "",
    tradeName: partner?.tradeName ?? "",
    email: partner?.email ?? "",
    phone: partner?.phone ? maskPhone(partner.phone) : "",
    pixKey: partner?.pixKey ?? "",
    notes: partner?.notes ?? "",
    active: partner?.active ?? true,
  };
}

export function toPartnerInput(values: PartnerFormValues): PartnerInput {
  const isCompany = values.documentType === "CNPJ";
  return {
    documentType: values.documentType,
    document: isCompany
      ? normalizeCnpj(values.document)
      : onlyDigits(values.document),
    name: values.name,
    // A person has no trade name.
    tradeName: isCompany ? values.tradeName || null : null,
    email: values.email.toLowerCase(),
    phone: onlyDigits(values.phone) || null,
    pixKey: values.pixKey || null,
    notes: values.notes || null,
    active: values.active,
  };
}
