import { http } from "@/services/http/client";
import type {
  LeadFormInfo,
  QualificationInput,
  QuestionnaireState,
  RegistrationInput,
  StartQuestionnaireInput,
} from "@/types/public-lead";

const base = (token: string) =>
  `/public/questionnaire/${encodeURIComponent(token)}`;

/** Public lead capture and questionnaire (no login: /quero-alugar, /questionario). */
export const publicLeadService = {
  async leadForm() {
    const { data } = await http.get<LeadFormInfo>("/public/lead-form");
    return data;
  },

  /** Opens the lead and its questionnaire; null token = the honeypot caught it. */
  async start(input: StartQuestionnaireInput) {
    const { data } = await http.post<{ token: string | null }>(
      "/public/questionnaire",
      input,
    );
    return data.token;
  },

  async questionnaire(token: string) {
    const { data } = await http.get<QuestionnaireState>(base(token));
    return data;
  },

  async saveQualification(token: string, input: QualificationInput) {
    await http.post(`${base(token)}/qualification`, input);
  },

  async choosePlan(token: string, planId: string) {
    await http.post(`${base(token)}/plan`, { planId });
  },

  async submitRegistration(token: string, input: RegistrationInput) {
    const form = new FormData();
    for (const [key, value] of Object.entries(input)) {
      if (key === "cnhFile") continue;
      form.append(key, String(value ?? ""));
    }
    if (input.cnhFile) form.append("cnhFile", input.cnhFile);
    const { data } = await http.post<{ whatsappUrl: string | null }>(
      `${base(token)}/registration`,
      form,
    );
    return data.whatsappUrl;
  },
};
