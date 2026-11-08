import { z } from "zod";
import type {
  ProposalTemplateDetail,
  ProposalTemplateInput,
} from "@/types/template";

/**
 * Mirrors the API (name 2–120, body required). A clause needs both the
 * title and the text: the API would silently drop a half-filled row.
 */
export const proposalTemplateSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do modelo").max(120),
  active: z.boolean(),
  bodyHtml: z.string().min(1, "Escreva o corpo da proposta"),
  clauses: z.array(
    z
      .object({ label: z.string(), html: z.string() })
      .superRefine((clause, ctx) => {
        const hasLabel = clause.label.trim().length > 0;
        const hasHtml = clause.html.trim().length > 0;
        if (hasHtml && !hasLabel) {
          ctx.addIssue({
            code: "custom",
            path: ["label"],
            message: "Dê um título à cláusula",
          });
        }
        if (hasLabel && !hasHtml) {
          ctx.addIssue({
            code: "custom",
            path: ["html"],
            message: "Escreva o texto da cláusula",
          });
        }
      }),
  ),
});

export type ProposalTemplateValues = z.infer<typeof proposalTemplateSchema>;

/** Form defaults: a new template starts active, with no clauses. */
export function proposalTemplateDefaults(
  template?: ProposalTemplateDetail,
): ProposalTemplateValues {
  return {
    name: template?.name ?? "",
    active: template?.active ?? true,
    bodyHtml: template?.bodyHtml ?? "",
    clauses:
      template?.clauses.map(({ label, html }) => ({ label, html })) ?? [],
  };
}

/** Values → body: empty rows (both blank) are left out. */
export function toProposalTemplateInput(
  values: ProposalTemplateValues,
): ProposalTemplateInput {
  return {
    name: values.name.trim(),
    active: values.active,
    bodyHtml: values.bodyHtml,
    clauses: values.clauses
      .map((clause) => ({ label: clause.label.trim(), html: clause.html }))
      .filter((clause) => clause.label || clause.html.trim()),
  };
}
