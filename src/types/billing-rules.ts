/** Configurações › Regras de cobrança (GET /settings/billing-rules): fixed in the backend. */
export interface BillingRules {
  finePercent: number;
  interestPercentPerMonth: number;
  from: string;
  dailyRentExempt: boolean;
  notes: string[];
}
