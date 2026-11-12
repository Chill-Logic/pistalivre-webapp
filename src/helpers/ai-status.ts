import type { AiChatLiveStep } from "@/types/ai";

/** What the assistant is doing, in a friendlier voice than the tool's title. */
const BY_TOOL: Record<string, string> = {
  buscar_clientes: "Procurando o cliente…",
  ver_cliente: "Abrindo a ficha do cliente…",
  buscar_locacoes: "Vasculhando as locações…",
  ver_locacao: "Abrindo a locação…",
  situacao_do_aluguel: "Conferindo o aluguel…",
  buscar_cobrancas: "Revirando as cobranças…",
  ver_cobranca: "Olhando a cobrança de perto…",
  inadimplencia: "Vendo quem está devendo…",
  resumo_financeiro: "Fazendo as contas do mês…",
  saldo_em_caixa: "Espiando o caixa…",
  extrato_bancario: "Folheando o extrato…",
  contas_do_mes: "Separando as contas do mês…",
  buscar_dividas: "Procurando as dívidas…",
  ver_divida: "Abrindo a dívida…",
  resultado_por_cliente: "Calculando o resultado por cliente…",
  buscar_veiculos: "Dando uma volta pela frota…",
  buscar_manutencoes: "Checando a oficina…",
  ver_manutencao: "Abrindo a manutenção…",
  buscar_vistorias: "Conferindo as vistorias…",
  ver_vistoria: "Abrindo a vistoria…",
  ler_contrato: "Lendo o contrato…",
  abrir_rascunho_contrato: "Abrindo o rascunho do contrato…",
  ler_documento: "Lendo o documento…",
  substituir_trecho: "Ajustando o texto…",
  inserir_trecho: "Escrevendo o trecho novo…",
  remover_trecho: "Tirando o trecho…",
  reescrever_documento: "Reescrevendo o documento…",
  listar_planos: "Consultando os planos…",
  listar_modelos_de_contrato: "Procurando o modelo de contrato…",
  buscar_leads: "Procurando no CRM…",
  ver_lead: "Abrindo o lead…",
  funil_crm: "Olhando o funil…",
  buscar_propostas: "Procurando as propostas…",
  buscar_assinaturas: "Conferindo as assinaturas…",
  buscar_parceiros: "Procurando os parceiros…",
  ver_parceiro: "Abrindo o parceiro…",
  ver_contrato_de_parceiro: "Lendo o contrato do parceiro…",
  buscar_documentos: "Revirando os documentos…",
  buscar_reembolsos: "Conferindo os reembolsos…",
  ver_empresa: "Abrindo os dados da empresa…",
  painel: "Dando uma olhada no painel…",
  projecao: "Projetando os números…",
  uso_da_ia: "Somando o uso da IA…",
  listar_anexos_enviados: "Olhando os anexos…",
  cadastrar_cliente: "Preparando o cadastro…",
  criar_locacao_rascunho: "Montando a locação…",
  anexar_documentos_ao_cliente: "Separando os documentos…",
  guiar_na_tela: "Preparando o caminho na tela…",
  registrar_pergunta_sem_resposta: "Anotando para a equipe…",
};

/** Between tools: the model is thinking, not writing yet. */
const BETWEEN = [
  "Juntando as peças…",
  "Conferindo os detalhes…",
  "Ligando os pontos…",
  "Organizando a resposta…",
];

/** The status line under the live steps. */
export function aiStatusText(live: AiChatLiveStep[]): string {
  const running = [...live].reverse().find((step) => step.status === "running");
  if (running) {
    if (BY_TOOL[running.tool]) return BY_TOOL[running.tool];
    if (running.tool.startsWith("buscar_")) return "Procurando…";
    if (running.tool.startsWith("ver_")) return "Abrindo os detalhes…";
    return `${running.title}…`;
  }
  if (live.length === 0) return "Pensando…";
  return BETWEEN[(live.length - 1) % BETWEEN.length];
}
