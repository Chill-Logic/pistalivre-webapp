import type { SelectOption } from "@/helpers/select";

/** What /quero-alugar and /questionario show before anyone says who they are. */
export type LeadFormInfo = {
  companyName: string;
  models: { id: string; label: string }[];
};

/** One visit's campaign attribution (UTMs, referrer, landing). */
export type LeadTouch = {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  referrer: string;
  landing: string;
  touchAt: string;
};

export type StartQuestionnaireInput = {
  name: string;
  phone: string;
  email: string | null;
  desiredModelId: string | null;
  desiredVehicle: string | null;
  ref: string | null;
  /** Honeypot: people never fill it. */
  website: string;
  first: LeadTouch;
  last: LeadTouch;
};

export type QuestionnaireStep = "QUALIFICATION" | "PLANS" | "REGISTRATION" | "DONE";

/** A plan as the customer reads it: price and terms formatted by the server. */
export type QuestionnairePlan = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  terms: string;
  highlights: string[];
  ownershipAtEnd: boolean;
};

export type QuestionnaireState = {
  step: QuestionnaireStep;
  firstName: string | null;
  options: {
    workApps: string[];
    appsExperience: SelectOption[];
    incomeType: SelectOption[];
    maritalStatus: string[];
    defaultNationality: string;
  };
  plans: QuestionnairePlan[];
  fleet: { label: string; mileage: number | null }[];
  plan: QuestionnairePlan | null;
  defaults: { name: string; email: string; phone: string };
  whatsappUrl: string | null;
};

export type QualificationInput = {
  workApps: string[];
  appsExperience: string;
  incomeType: string;
  wantsOwnVehicle: boolean;
};

/** Step 3: the same fields as the staff's customer form (+ the CNH). */
export type RegistrationInput = {
  name: string;
  email: string;
  phone: string;
  document: string;
  birthDate: string;
  nationality: string;
  maritalStatus: string;
  profession: string;
  rg: string;
  zip: string;
  addressLine: string;
  addressNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  driverLicense: string;
  driverLicenseIssuedAt: string;
  driverLicenseValidUntil: string;
  cnhFile: File | null;
};
