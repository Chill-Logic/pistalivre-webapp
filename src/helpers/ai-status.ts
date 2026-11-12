import type { AiChatLiveStep } from "@/types/ai";

/**
 * What the assistant is doing, in a friendlier voice: a few ways of saying
 * each tool, one picked at random per call (the same while it runs).
 */
const BY_TOOL: Record<string, string[]> = {
  buscar_clientes: [
    "Procurando o cliente…",
    "Folheando a lista de clientes…",
    "Atrás do cliente…",
    "Puxando a ficha de clientes…",
  ],
  ver_cliente: [
    "Abrindo a ficha do cliente…",
    "Lendo o cadastro…",
    "Conferindo os dados do cliente…",
  ],
  buscar_locacoes: [
    "Vasculhando as locações…",
    "Revirando os contratos de locação…",
    "Procurando a locação…",
    "Passando o olho nas locações…",
  ],
  ver_locacao: [
    "Abrindo a locação…",
    "Lendo os detalhes da locação…",
    "Conferindo a locação…",
  ],
  situacao_do_aluguel: [
    "Conferindo o aluguel…",
    "Fazendo as contas do aluguel…",
    "Vendo o que já foi pago…",
    "Batendo os pagamentos…",
  ],
  buscar_cobrancas: [
    "Revirando as cobranças…",
    "Olhando os boletos e pix…",
    "Conferindo as cobranças…",
    "Procurando a cobrança…",
  ],
  ver_cobranca: ["Olhando a cobrança de perto…", "Abrindo a cobrança…"],
  inadimplencia: [
    "Vendo quem está devendo…",
    "Checando os atrasados…",
    "Contando as cobranças vencidas…",
  ],
  resumo_financeiro: [
    "Fazendo as contas do mês…",
    "Somando entradas e saídas…",
    "Fechando o resumo…",
  ],
  saldo_em_caixa: [
    "Espiando o caixa…",
    "Contando o dinheiro em caixa…",
    "Vendo o saldo…",
  ],
  extrato_bancario: ["Folheando o extrato…", "Lendo o extrato do banco…"],
  contas_do_mes: [
    "Separando as contas do mês…",
    "Conferindo as contas a pagar…",
  ],
  buscar_dividas: [
    "Procurando as dívidas…",
    "Conferindo o que a empresa deve…",
  ],
  ver_divida: ["Abrindo a dívida…", "Lendo as parcelas…"],
  resultado_por_cliente: [
    "Calculando o resultado por cliente…",
    "Vendo quem dá mais retorno…",
  ],
  buscar_veiculos: [
    "Dando uma volta pela frota…",
    "Contando as motos…",
    "Procurando na garagem…",
    "Passando pela frota…",
  ],
  buscar_manutencoes: [
    "Checando a oficina…",
    "Vendo as manutenções…",
    "Conferindo o histórico da oficina…",
  ],
  ver_manutencao: ["Abrindo a manutenção…", "Lendo a ordem de serviço…"],
  buscar_vistorias: [
    "Conferindo as vistorias…",
    "Olhando as fotos das vistorias…",
  ],
  ver_vistoria: ["Abrindo a vistoria…", "Vendo as fotos…"],
  ler_contrato: [
    "Lendo o contrato…",
    "Passando o olho nas cláusulas…",
    "Conferindo o contrato…",
  ],
  abrir_rascunho_contrato: [
    "Abrindo o rascunho do contrato…",
    "Pegando o rascunho…",
  ],
  ler_documento: ["Lendo o documento…", "Passando o olho no texto…"],
  substituir_trecho: ["Ajustando o texto…", "Trocando o trecho…"],
  inserir_trecho: ["Escrevendo o trecho novo…", "Acrescentando o texto…"],
  remover_trecho: ["Tirando o trecho…", "Limpando o texto…"],
  reescrever_documento: ["Reescrevendo o documento…", "Passando a limpo…"],
  listar_planos: ["Consultando os planos…", "Abrindo o cardápio de planos…"],
  listar_modelos_de_contrato: [
    "Procurando o modelo de contrato…",
    "Escolhendo o modelo…",
  ],
  buscar_leads: ["Procurando no CRM…", "Vasculhando os leads…"],
  ver_lead: ["Abrindo o lead…", "Lendo a conversa com o lead…"],
  funil_crm: ["Olhando o funil…", "Contando os leads por etapa…"],
  buscar_propostas: ["Procurando as propostas…", "Folheando as propostas…"],
  buscar_assinaturas: ["Conferindo as assinaturas…", "Vendo quem já assinou…"],
  buscar_parceiros: ["Procurando os parceiros…", "Olhando os investidores…"],
  ver_parceiro: ["Abrindo o parceiro…", "Lendo a ficha do parceiro…"],
  ver_contrato_de_parceiro: [
    "Lendo o contrato do parceiro…",
    "Conferindo os termos com o parceiro…",
  ],
  buscar_documentos: ["Revirando os documentos…", "Procurando nas pastas…"],
  buscar_reembolsos: [
    "Conferindo os reembolsos…",
    "Vendo os pedidos de reembolso…",
  ],
  ver_empresa: ["Abrindo os dados da empresa…", "Pegando a ficha da empresa…"],
  painel: ["Dando uma olhada no painel…", "Conferindo os números do painel…"],
  projecao: ["Projetando os números…", "Olhando para o futuro…"],
  uso_da_ia: ["Somando o uso da IA…", "Contando os tokens…"],
  listar_anexos_enviados: ["Olhando os anexos…", "Conferindo os arquivos…"],
  cadastrar_cliente: ["Preparando o cadastro…", "Montando a ficha do cliente…"],
  criar_locacao_rascunho: [
    "Montando a locação…",
    "Preparando o rascunho da locação…",
  ],
  anexar_documentos_ao_cliente: [
    "Separando os documentos…",
    "Arrumando os arquivos na ficha…",
  ],
  guiar_na_tela: ["Preparando o caminho na tela…", "Marcando o caminho…"],
  oferecer_opcoes: ["Separando as opções…", "Pensando nas possibilidades…"],
  registrar_pergunta_sem_resposta: [
    "Anotando para a equipe…",
    "Deixando um recado para a equipe…",
  ],
};

/** Between tools: the model is thinking, not writing yet. */
const BETWEEN = [
  "Juntando as peças…",
  "Conferindo os detalhes…",
  "Ligando os pontos…",
  "Organizando a resposta…",
  "Pensando no próximo passo…",
  "Quase lá…",
  "Cruzando as informações…",
];

const THINKING = [
  "Pensando…",
  "Entendendo o pedido…",
  "Deixa eu ver…",
  "Um instante…",
];

/** The same pick for the same key (a step's id): random per call, steady while it runs. */
function pick(options: string[], key: string): string {
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return options[Math.abs(hash) % options.length];
}

/** The status line under the live steps. */
export function aiStatusText(live: AiChatLiveStep[], seed: string): string {
  const running = [...live].reverse().find((step) => step.status === "running");
  if (running) {
    const key = `${seed}:${running.id}`;
    if (BY_TOOL[running.tool]) return pick(BY_TOOL[running.tool], key);
    if (running.tool.startsWith("buscar_"))
      return pick(["Procurando…", "Vasculhando…"], key);
    if (running.tool.startsWith("ver_"))
      return pick(["Abrindo os detalhes…", "Lendo a ficha…"], key);
    return `${running.title}…`;
  }
  if (live.length === 0) return pick(THINKING, seed);
  return pick(BETWEEN, `${seed}:${live.length}`);
}
