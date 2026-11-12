import { http } from "@/services/http/client";
import type {
  LeadFormInfo,
  PreRegistrationAttribution,
  PreRegistrationInfo,
  PreRegistrationInput,
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
      // Files go as files (the form may also carry the pre-registration's, unused here).
      if (key === "cnhFile" || key === "proofOfAddressFile" || key === "otherFiles") continue;
      form.append(key, String(value ?? ""));
    }
    if (input.cnhFile) form.append("cnhFile", input.cnhFile);
    const { data } = await http.post<{ whatsappUrl: string | null }>(
      `${base(token)}/registration`,
      form,
    );
    return data.whatsappUrl;
  },

  async preRegistrationInfo() {
    const { data } = await http.get<PreRegistrationInfo>("/public/pre-registration");
    return data;
  },

  /** /pre-cadastro: data + documents in one go; returns the WhatsApp link (or null). */
  async submitPreRegistration(input: PreRegistrationInput, attribution: PreRegistrationAttribution) {
    const form = new FormData();
    const { cnhFile, proofOfAddressFile, otherFiles, ...fields } = input;
    for (const [key, value] of Object.entries(fields)) form.append(key, String(value ?? ""));
    if (cnhFile) form.append("cnhFile", cnhFile);
    if (proofOfAddressFile) form.append("proofOfAddressFile", proofOfAddressFile);
    for (const file of otherFiles) form.append("otherFiles", file);
    form.append("ref", attribution.ref);
    form.append("first", JSON.stringify(attribution.first));
    form.append("last", JSON.stringify(attribution.last));
    const { data } = await http.post<{ whatsappUrl: string | null }>(
      "/public/pre-registration",
      form,
    );
    return data.whatsappUrl;
  },
};
