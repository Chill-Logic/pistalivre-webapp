import {
  BadgeDollarSign,
  BookOpen,
  BriefcaseBusiness,
  Car,
  ClipboardCheck,
  FileSignature,
  FileText,
  HandCoins,
  Handshake,
  Link2,
  Megaphone,
  PiggyBank,
  Plus,
  Receipt,
  Scale,
  UserRound,
  Wallet,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { SearchEntityType } from "@/types/search";

/** Icon of each kind of result (and of the "shortcut" group). */
export const SEARCH_TYPE_ICONS: Record<SearchEntityType | "shortcut", LucideIcon> = {
  shortcut: Zap,
  rental: FileSignature,
  payment: BadgeDollarSign,
  customer: UserRound,
  vehicle: Car,
  maintenance: Wrench,
  customerDebt: Scale,
  receipt: HandCoins,
  lead: Megaphone,
  proposal: Handshake,
  document: FileText,
  inspection: ClipboardCheck,
  debt: PiggyBank,
  expense: Receipt,
  supplier: Wallet,
  partner: BriefcaseBusiness,
};

/** One result kind, said in the singular (the preview's badge). */
export const SEARCH_TYPE_SINGULAR: Record<SearchEntityType, string> = {
  rental: "Locação",
  payment: "Cobrança",
  customer: "Cliente",
  vehicle: "Veículo",
  maintenance: "Manutenção",
  customerDebt: "Débito do cliente",
  receipt: "Pix recebido",
  lead: "Lead",
  proposal: "Proposta",
  document: "Documento",
  inspection: "Vistoria",
  debt: "Dívida da empresa",
  expense: "Conta do mês",
  supplier: "Custo fixo",
  partner: "Parceiro",
};

/** Something to DO from the search ("Nova locação"), not a record to open. */
export type SearchAction = {
  id: string;
  label: string;
  /** Other words people use for it. */
  keywords: string[];
  icon: LucideIcon;
  /** Opens this page… */
  to?: string;
  /** …or runs this (copy a link). */
  run?: "copyPreRegistrationLink";
  adminOnly?: boolean;
};

export const SEARCH_ACTIONS: SearchAction[] = [
  { id: "new-rental", label: "Nova locação", keywords: ["alugar", "contrato", "locacao"], icon: Plus, to: ROUTES.rentalNew },
  { id: "new-customer", label: "Novo cliente", keywords: ["cadastrar cliente", "locatario"], icon: Plus, to: ROUTES.customerNew },
  { id: "new-maintenance", label: "Registrar manutenção", keywords: ["nova manutenção", "oficina", "conserto", "revisão"], icon: Plus, to: ROUTES.maintenanceNew },
  { id: "new-inspection", label: "Nova vistoria", keywords: ["vistoriar", "fotos", "km"], icon: Plus, to: ROUTES.inspectionPick },
  { id: "new-vehicle", label: "Novo veículo", keywords: ["cadastrar moto", "cadastrar carro", "frota"], icon: Plus, to: ROUTES.vehicleNew },
  { id: "new-lead", label: "Novo lead", keywords: ["interessado", "crm", "prospect"], icon: Plus, to: ROUTES.leadNew },
  { id: "new-proposal", label: "Nova proposta", keywords: ["orçamento", "oferta"], icon: Plus, to: ROUTES.proposalNew },
  { id: "charge", label: "Emitir cobrança avulsa", keywords: ["cobrar", "pix", "boleto", "registrar recebimento", "dar baixa", "financeiro"], icon: BadgeDollarSign, to: ROUTES.finance },
  { id: "new-debt", label: "Registrar dívida da empresa", keywords: ["empréstimo", "financiamento", "débito"], icon: Plus, to: ROUTES.debtNew },
  { id: "new-supplier", label: "Novo custo fixo", keywords: ["fornecedor", "despesa", "conta"], icon: Plus, to: ROUTES.supplierNew },
  { id: "bills", label: "Contas do mês", keywords: ["pagar contas", "despesas", "gastos"], icon: Receipt, to: ROUTES.financeBills },
  { id: "pre-registration", label: "Pré-cadastro (copiar link)", keywords: ["link do cliente", "cadastro", "documentos", "cnh", "comprovante"], icon: Link2, run: "copyPreRegistrationLink" },
  { id: "ai-actions", label: "Ações da IA", keywords: ["livrinho", "confirmar", "prévia"], icon: BookOpen, to: ROUTES.aiActions },
];

/** Shown with an empty box: what people do most. */
export const SUGGESTED_ACTION_IDS = ["new-rental", "charge", "new-maintenance", "new-customer", "pre-registration"];

/** The hints under an empty box ("try a plate…"). */
export const SEARCH_HINTS = ["Placa (TUJ4I72)", "LOC-…", "CPF ou telefone", "Valor (130,16)", "Data (22/07)"];

export const RECENT_SEARCHES_MAX = 8;
