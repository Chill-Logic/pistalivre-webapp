# Comece aqui — pistalivre-webapp

Resumo para a próxima sessão. Atualizado em **2026-11-09 (noite)**. O histórico completo fica em
`docs/handoff.md`, as regras em `CLAUDE.md`, o contrato da API em `../pista-livre/docs/api-v1.md` e a auditoria
Next × webapp em `docs/auditoria-next.md`. **Fale com o dono sempre em português do Brasil**, inclusive nas frases
curtas entre ferramentas e nos relatórios de subagentes.

## Estado

- **O webapp cobre 100% do que o Next cobria** (gestão e portal). A auditoria tela a tela de 2026-11-08 achou os furos;
  todos foram fechados (backend na `feat/api-v1-spa`, front na `main`). Checklist inteiro marcado em
  `docs/auditoria-next.md`. Agora a fase é de **refinamento visual**: o dono compara com o Next e aponta.
- Nunca há saída de dinheiro (pix out, transferência, boleto): é sempre por fora. O histórico de transferências
  emitidas é só leitura.
- "Fornecedores" agora é **"Custos fixos"** na interface (rota `/gestao/custos-fixos`, a antiga redireciona); código
  e API seguem `supplier`.
- **PWA (2026-11-09):** cada domínio instala com o nome da área (`constants/pwa`, `helpers/pwa-manifest`, manifests
  gerados no `vite.config`). Toda chamada leva `X-Client-Mode: pwa|browser`; o backend grava primeiro/último uso,
  clique em "Instalar" e "Agora não" (`GET /auth/me` → `user.pwa`). Convite no celular para quem nunca usou nem
  baixou ("Agora não" = 7 dias); "Abrir no app" fixo no header para quem já usou/baixou; gestão mostra o uso no
  cliente e no usuário e filtra clientes por `app=`. **Backend antes do front** (o CORS precisa do header novo).
- **Integrações (Asaas, Inter, Clicksign) só admin**: agente vê só a situação (decisão do dono).
- **IA agêntica + MCP (2026-11-09):** chat de IA ao lado do editor de contrato e de proposta (`ai-chat-dock`/
  `ai-chat-panel`, no lugar do "Personalizar com IA"); menu **Integrações** (todos: conectar Claude/ChatGPT/Gemini ao
  MCP com tutoriais, meus apps; admin: abas Permissões e Aplicativos) e **Auditoria** (só admin, `adminOnly` no
  NavItem). Consentimento OAuth em `/gestao/autorizar-ia`. Backend e decisões em `../pista-livre/docs/handoff-ia-mcp.md`.
- **Ferramentas da IA em todas as áreas (no ar desde 2026-11-09 13:43: backend `0774cd5`, webapp `1948229`):** 50 ferramentas (leitura de
  tudo, escritas leves do CRM sempre com confirmação). No chat, cada escrita proposta vira um cartão com
  **Confirmar/Cancelar** (`ai-action-card`, `/ai/actions/:id/confirm|cancel`); Permissões agrupadas por área, com
  "Escrita" e "Começa desligada"; **Auditoria › Lacunas** (`/gestao/auditoria/lacunas`): perguntas que a IA não
  conseguiu responder e ferramentas recusadas por falta de permissão. **Backend antes do front.**
- **Parceiros e área do parceiro (2026-11-09, local, ainda não publicado):** gestão › **Parceiros** (equipe toda):
  parceiro pessoa ou empresa (`document` + `documentType`), acesso à área do parceiro, contratos de investimento
  (aporte em bens ou dinheiro, % do faturamento ou do lucro) ou administração (taxa), com 1 a N motos e a janela de
  cada uma; contrato em PDF montado no editor com o assistente de IA (`/gestao/parceiros/contratos/:id/documento`).
  Terceiro realm **`parceiro`** (`app.parceiro…`; `/parceiro` em localhost): login próprio, painel com menu lateral no
  desktop, contratos, motos, locações (extrato recortado na janela do contrato), PDF do contrato e perfil — só
  leitura, regra de visibilidade no servidor. O portal do cliente não muda. Controle segmentado novo
  (`atoms/segmented-control`, tokens `--segment-*`). Dev: `parceiro@dev.com.br` / `parceiro123` (Meteor PLA1009 com
  histórico). Proposta e decisões: doc "Proposta: área do parceiro". **Backend antes do front.**
  - **Titularidade no veículo:** a ficha do veículo tem **Titular** (em nome de quem está o documento) e
    **Proprietário** (de quem é), empresa ou um parceiro; a lista mostra o selo "Parceiro: …" embaixo do nome.
    Investimento: titular a empresa, proprietário o investidor; administração: o parceiro nos dois. O servidor
    recusa (422) incluir no contrato um veículo que não bate. "Cadastrar novo veículo" no diálogo do contrato
    abre o cadastro já preenchido e volta ao contrato com o veículo escolhido.
  - **Proposta versionada:** o editor (texto-base + chat de IA) → "Enviar proposta ao parceiro" congela termos,
    veículos e PDF como versão N. O parceiro **aceita** (grava data, IP e navegador; pede marcar "Li o
    contrato") ou **recusa com motivo** na área dele. Versão nova retira a pendente; mudar um termo também.
    **Ativar exige a versão aceita idêntica aos termos.** Da aceita, "Enviar para assinatura" cria o pedido em
    **rascunho** no módulo de Assinaturas (parceiro já como signatário); a tela de Assinaturas envia ao
    Clicksign. Contrato ativo trava os termos (só saída de veículo e encerramento).
  - **Despesas por base:** no faturamento, o padrão é o modelo do contador (manutenção do parceiro); no lucro,
    "Parceiro" fica bloqueado (as despesas saem antes da divisão). A apuração no texto segue a recorrência do
    repasse (semanal, quinzenal ou mensal).
  - **Extrato do parceiro:** extrato do aluguel da locação (tela e PDF), como o cliente vê, preso à janela do
    contrato e sem os débitos do cliente.
  - **Menu:** lateral recolhível no desktop, barra de baixo no celular; tema claro e escuro.
  - **Volta real no dev (2026-11-09):** parceiro "Investidor Teste QA" (`investidor.qa.20261109@teste.dev` /
    `investidorqa123`), contrato PAR-RJUE36QC (investimento, 50% do faturamento, quinzenal) com a QAT9C11:
    v1 recusada, v2 retirada, v3 aceita, ativo, pedido de assinatura em rascunho (nada enviado ao Clicksign).
- **Contas do mês (no ar desde 2026-11-09 10:27):** Financeiro › Contas do mês (`/gestao/financeiro/contas?mes=`)
  junta custos fixos, parcelas de dívidas e avulsas do mês, com os meses anteriores em aberto. Registrar = pago (dia,
  valor, comprovante), em aberto ou sem cobrança, inclusive retroativo; parcela paga pelo diálogo da dívida. O custo
  fixo ganhou "Como é cobrado", "Vence todo" (opcional), "Desde"/"Vale até" e o card "Meses". Sem "vencido" (o
  dono quer organização, não julgamento). Backend: `Expense` + `GET /expenses/month` (`c062d80` no `pista-livre`).
- **IA configurável (no ar desde 2026-11-09 10:27):** provedor (Anthropic, OpenAI, Gemini), modelo e chave em Empresa ›
  Integrações › Inteligência artificial; o `GEMINI_*` do env saiu (`9c0e9a6`). Depois de publicar, a IA fica
  desligada até alguém salvar a integração.

## O que está no ar

| O quê | Onde |
|---|---|
| Webapp, equipe | https://app.gestao.pistalivrelocacoes.com.br |
| Webapp, portal do cliente | https://app.cliente.pistalivrelocacoes.com.br |
| Webapp, endereço da Vercel | https://pistalivre-webapp.vercel.app (as duas áreas) |
| Backend (Next + `/api/v1`) | https://pistalivrelocacoes.com.br (Railway publica a `main` do `pista-livre`) |
| Site antigo (telas Next) | removido em 2026-11-09: `/`, `/gestao` e `/area-cliente` redirecionam para o SPA |

- Um build do webapp serve as duas áreas. O app procura `gestao`/`cliente` no endereço (`helpers/host-realm`) e
  manda a página da outra área para o domínio certo. Em `localhost` e no endereço da Vercel, as duas áreas funcionam.
- **Última publicação: 2026-11-09 ~00:20** (aval do dono): backend `main` do `pista-livre` em `3de0dce` (desconto
  no `amounts`, telas Next removidas com redirecionamento) e webapp `8126a6b` na Vercel (endereços limpos, vistoria
  avulsa, Locações abrindo em todas as situações). Conferido: redirecionamentos 307 do site antigo e dos caminhos com
  prefixo, `/quero-alugar` e `/api/v1` respondendo.
- **No ar desde 2026-11-08 ~16:05** (aval do dono): backend `main` do `pista-livre` em `c99b0d3` (merge da
  `feat/api-v1-spa`, Railway publicou às 16:01) e webapp `74bf7f6` na Vercel (deploy
  `pistalivre-webapp-dsjxm1avv`). Conferido: rotas novas respondem (401 sem token), rótulos "Custos fixos" na
  produção, os 3 endereços servem o build novo e o CORS aceita app.gestao e app.cliente.

## Rodar local

- WSL: `npm`/`node`/`npx` "curtos" travam (funções do nvm no zsh). Use os binários por caminho completo com o PATH
  ajustado: `export PATH=/home/ojhon/.nvm/versions/node/v22.15.1/bin:/usr/bin:/bin` e
  `/home/ojhon/.nvm/versions/node/v22.15.1/bin/{node,npm,npx}`.
- API: `docker compose up dev` no `../pista-livre` (:3000). **Não derrubar.** Para trocar variável de ambiente,
  recriar com `docker compose up -d --no-deps --no-build dev` (o `restart` não relê a env). O dev fica lento
  (10 s+ por rota na primeira compilação).
- Front: `node node_modules/vite/bin/vite.js --host --port 5173 --strictPort`. **Confira para onde ele aponta**: em
  2026-11-08 o Vite da 5173 (subido por outra sessão) estava falando com a API de **produção**. Para garantir o dev:
  `VITE_API_URL=http://localhost:3000/api node node_modules/vite/bin/vite.js …` (variável do processo vence os
  `.env`). No WSL o Vite às vezes não percebe um arquivo alterado: dê `touch` no arquivo.
- Logins do dev: `admin@pistalivre.dev` / `admin123` e portal `cliente.teste@pistalivre.dev` / `teste123` (5 erros =
  15 min de bloqueio). Dados de demonstração: clientes "Demo" (Carlos Demo tem locação semanal com dados).

## Publicar (só quando o dono pedir)

- **Ordem:** backend primeiro (o front novo depende dos endpoints), depois o webapp.
- **Backend:** juntar a `feat/api-v1-spa` na `main` do `pista-livre`; o Railway publica sozinho (~9 min). Antes,
  conferir se a branch está toda no GitHub (`git rev-list origin/feat/api-v1-spa..feat/api-v1-spa`).
- **Webapp:** desde 2026-11-09 o GitHub está ligado à Vercel: **push na `main` publica em produção** (outras
  branches ganham prévia). Por isso, **push na `main` só com aval do dono**; sem aval, commit local ou push numa
  branch. A CLI (`/home/ojhon/.nvm/versions/node/v22.15.1/bin/vercel deploy --prod`) segue valendo.

## Regras que mais pegam

- Zero HTML nativo fora de `components/atoms` (grep no CLAUDE.md), Row/Col (nunca `grid-cols-*`),
  Radix/shadcn (nada de select ou date nativo), skeleton no formato real, sem subtítulo em página.
- **Dinheiro só no servidor**: o front não subtrai nem calcula juros. Prévias (juros da dívida, saldo depois do
  pagamento, taxa de inadimplência, semanas para quitar) vêm de endpoints próprios.
- Escritas que emitem cobrança, baixa, NF, pagamento, contrato ou exportação levam `Idempotency-Key`
  (`hooks/ui/useIdempotencyKey`). Erros: `helpers/money-errors`. Respostas em blob com erro: o interceptor lê o
  corpo (`withJsonErrorBody`), então a mensagem do servidor aparece.
- Tempo real: `useRealtimeSync` (nos dois shells) invalida os caches por evento (`constants/realtime.ts`). Evento
  novo no backend → acrescentar no mapa.
- Testes visuais: Puppeteer do `../pista-livre/node_modules/puppeteer`, em 390×844 e 1366×820, com **escritas
  simuladas** e scripts e prints **no scratchpad**, nunca na pasta do projeto. Vite fora da 5173 → Chrome com
  `--disable-web-security` (a API do dev só aceita CORS da 5173).
- **Várias sessões na mesma pasta compartilham o índice do git**: `git add <caminhos>` **e** `git commit <caminhos>`.
- **Subagentes em paralelo**: use cópias isoladas (worktree em `.claude/worktrees/`, já ignorado em
  `.git/info/exclude`), com `node_modules` como link para o principal; junte na `main` com `cherry-pick` e rode
  `tsc -b` + `eslint src` + o grep a cada junção (os conflitos costumam ser os dois lados acrescentando).
- Ao abrir subagentes/forks: pedir que respondam **em português**.

## Pendências

**Testar à mão (num navegador de verdade; nunca rodaram de verdade, só simuladas)**
- Gerar e excluir contrato; salvar CNH.
- Importar e vincular cliente do Asaas (o único "só no Asaas" do sandbox é uma pessoa real).
- Carteira pix pela equipe; notificações do Asaas do cliente.
- Criar e excluir vistoria pela gestão; formulário de vistoria do portal (foi refatorado, só os tipos checados).
- Salvar integrações, testar conexão e registrar o webhook do Inter (mexem nos provedores reais).
- Exportar o extrato e o PDF oficial do banco (o dev não tem Inter).
- Portal: anexar arquivo numa manutenção, "Regerar" pix expirado, trocar o tipo da vistoria para "Leitura de km".
- Enviar assinatura de ponta a ponta (dispara e-mail real pelo Clicksign).

**Decisão do dono**
- Nenhuma no momento. Feitos em 2026-11-09: telas Next removidas, endereços limpos, heap de 6 GB no dev
  (vale quando o container for recriado), `cnh.pdf` falso apagado.

**Área do parceiro — follow-ups (fase 2 em diante; anotado em 2026-11-09; detalhe no `CLAUDE.md` do backend):**
- **Conta corrente do contrato:** apurar no servidor quanto o parceiro tem a receber por período (faturamento ou lucro,
  taxa, despesas a cargo dele) e **registrar o repasse feito por fora** (dia, valor, comprovante — o sistema nunca paga).
  Hoje ele vê o que os veículos renderam, não "quanto você recebe este mês". Extrato do contrato na área do parceiro.
- **Despesas lançadas contra o contrato:** manutenção, seguro, rastreador, IPVA e multas entrando no demonstrativo,
  conforme "quem paga" do contrato (no lucro, antes da divisão; a cargo do parceiro, saem inteiras da parte dele).
- **Rescisão como fluxo do sistema:** encerrar/transferir locações, acerto final, transferência do veículo (paga pela
  empresa no investimento), titularidade nova na ficha, termo de rescisão para assinatura.
- **NF da administração** (a taxa); investimento não gera NF.
- **Fora do código:** contador (como registrar veículos pagos pelo investidor no nome da empresa; natureza do repasse),
  advogado (revisar o texto-base do contrato), e as perguntas em aberto do doc "Proposta: área do parceiro" (rescisão com
  locação ativa, perda total, valor da garantia, despesas no lucro e rateio do custo fixo).

**Pequenos (pode fazer sem decisão)**
- Rótulos de situação de contrato e de transferência estão em constantes locais (`constants/contract.ts`,
  `constants/transfer.ts`); se o `GET /labels` passar a ter esses mapas, mover para `LABEL_MAPS`.
- No celular, os botões de gestão dos documentos descem para a linha de baixo de cada item: o dono deve olhar.
- Débitos: o seletor Lista/Tabela apareceu uma vez marcando "Lista" com a tabela na tela (não confirmado).
- O dev perdeu um lead de teste que já existia (o teste do "apagar leads de teste" do backend).

## Sessões

- Backend: `pista-livre-99` (pode ter mudado de nome, veja com ListAgents). Contrato por mensagem, com o formato
  exato do endpoint. Entregou os 10 blocos da auditoria.
- Quem roda os serviços: `chill-logic-78`.
