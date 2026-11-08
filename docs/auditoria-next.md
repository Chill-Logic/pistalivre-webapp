# Auditoria Next × webapp (2026-11-08)

Comparação tela a tela de todas as telas do Next (`../pista-livre/src/app/gestao/**` e `area-cliente/**`) com o
webapp, para o webapp cobrir 100% do que o Next cobria. Só furos **funcionais** (o visual o dono refina depois).
Cada item: **F** = só front (a API v1 já atende) · **B** = precisa de endpoint/campo novo no backend · **D** = decisão
do dono. Marque `[x]` ao entregar.

**Publicação (regra do dono, 2026-11-08): só quando backend E frontend estiverem 100%.** Até lá, nada de
`vercel deploy` nem merge da `feat/api-v1-spa` na `main` do `pista-livre`. Commit/push na `main` deste repo pode
(o push não publica). Pedidos de backend enviados à sessão `pista-livre-99` no mesmo dia.

## Transversais

- [ ] **F — Tempo real (Socket.io).** O webapp não tem socket nenhum (`socket.io-client` nem está no
  `package.json`); só `refetchOnWindowFocus`. O Next atualizava sozinho cobranças, NF, reembolsos, assinaturas,
  status do veículo e o Financeiro. Contrato: `api-v1.md:35` (`io(origem,{auth:{token}})`, salas `staff` e
  `customer:<id>`). Fazer `hooks/realtime/useRealtimeEvent` + um mapa evento → `queryKeys` a invalidar
  (`payment.*`, `invoice.updated`, `reimbursement.*`, `signature.updated`, `vehicle.status_changed`,
  `transfer.updated`, `bank.updated`).
- [ ] **F — "Fornecedores" vira "Custos fixos"** (decisão do dono): menu, títulos, abas "Da empresa"/"Por
  veículo", Projeções; rota `/gestao/custos-fixos` com redirect da antiga. Código e API seguem `supplier`.
- [ ] **B — Último acesso.** A v1 só grava no login (token de 30 dias). Chamar `touchLastSeen` (limite de 5 min)
  em `requireBearerStaff` e `requireBearerCustomer` (`src/lib/api-v1.ts`).

## Documentos (cards de veículo, manutenção, cliente, fornecedor… e página Documentos)

- [ ] F — Seleção múltipla + "Excluir selecionados" (laço de `DELETE /documents/:id`).
- [ ] F — "Substituir arquivo" no diálogo de edição (`PATCH /documents/:id` multipart com `file`).
- [ ] F — "Tornar assinável" em cada PDF (`POST /signatures {documentId, name}`; reaproveitar `useSignatureMutations`).
- [ ] F — Página `/gestao/documentos` com escrita: editar, excluir, lote, tornar assinável, selo da assinatura com
  "ver pedido", cadeado de exclusão (`GET /documents/tree` já traz `owner` e `files[].signature`; passar
  `ManageDocumentActions` ao `DocumentBrowser`). Renomear nos resultados da busca.
- [ ] B — `signature{requestId,status}|null` em cada item de `documents[]` de `GET /customers/:id`, `/rentals/:id`
  (e demais donos), para o selo e o cadeado nos cards. Opcional: `slug` em `category` (achar o CRLV sem nome).

## Veículos e vistorias

- [ ] F — Card **Dívidas do veículo** (`GET /debts?vehicleId=`; `vehicleId` em `DebtFilters`; `?veiculo=` no
  `DebtNewPage` para pré-preencher).
- [ ] B+F — Card **Custos fixos do veículo**: B = `suppliers[{linkId, supplier{id,name}, monthlyAmount, active}]`
  em `GET /vehicles/:id` (`suppliers.linksByVehicle`); F = vincular/editar/desvincular (escrita já existe).
- [ ] B+F — **Nova vistoria pela gestão**: B = `POST /inspections` multipart (`vehicleId`, `rentalId?`, `type`,
  `performedBy`, `mileage`, `notes?`, `photo_<key>`, `check_<key>`) → 201 `{id}`; F = página a partir do
  `portal-inspection-form` + "Realizada por"; botão no veículo e na locação.
- [ ] B+F — **Excluir vistoria** pela gestão: `DELETE /inspections/:id` (`inspections.delete`).
- [ ] B — `performedByName` nos itens de `GET /inspections` (lista mostra "Agente · Fulano").
- [ ] B+F — **Ficha técnica (PDF)**: `GET /vehicles/:id/datasheet` com Bearer (hoje só cookie).
- [ ] F — Nome do locatário na lista de veículos vira link para a locação.
- [ ] F — Redirect `/gestao/veiculos/:id/vistorias/:inspectionId` → `/gestao/vistorias/:inspectionId`.

## Clientes

- [ ] B+F — **CNH editável** (hoje não há como cadastrar): `PUT /customers/:id/cnh {driverLicense, issuedAt, validUntil}`.
- [ ] B+F — Ligar/desligar **"Cliente de teste"** e **"Fora das métricas"**: `PATCH /customers/:id/flags`.
- [ ] B+F — **Carteira pix pela equipe**: `GET/POST /customers/:id/wallet`, `POST …/wallet/preview`,
  `PUT …/wallet/:methodId/default`, `DELETE …/wallet/:methodId` (cadastrar chave não é saída de dinheiro).
- [ ] B+F — **Notificações do Asaas** por evento/canal: `GET/PUT /customers/:id/notifications`.
- [ ] B+F — **Cobranças do cliente**, inclusive as fora do Asaas sem locação (hoje não aparecem em lugar nenhum):
  `GET /customers/:id/charges` (`billing.listChargesForCustomer`).
- [ ] F — Nas cobranças do Asaas com `paymentId`: "Dar baixa" e anexos (`ChargeSettleDialog`, `DocumentUploadDialog`).
- [ ] B+F — **Asaas na lista**: `asaasLinked` no item de `GET /customers`; `GET /customers/asaas-directory`
  (só no Asaas + conciliáveis); `POST /customers/:id/asaas-link`; `POST /customers/import-from-asaas`.
- [ ] B+F — **Assinaturas do cliente e da locação**: `GET /signatures?ownerType=&ownerId=`.
- [ ] F — Anexos de cada débito do cliente (`ownerType=CUSTOMER_DEBT`).
- [ ] B+F — Previsão "~N semanas para quitar" no débito, calculada no servidor (decidido).
- [ ] F — Idade ao lado da data de nascimento; nacionalidade.

## Locações

- [ ] B+F — **Contratos** (fluxo inteiro sumiu): `GET /rentals/:id/contracts`; `GET …/contracts/draft?templateId=`
  (422 `fields.cnh` sem CNH válida); `POST /contracts/preview` (PDF); `POST /contracts/personalize` + flag
  `aiEnabled`; `POST /rentals/:id/contracts` **IK**; `DELETE /contracts/:id`. F = página de 3 passos (modelo → CNH
  → editor com IA/visualizar/gerar) + seção Contratos (situação, ver/baixar, assinável, renomear, excluir).
  Separar no front os documentos de categoria "Contrato"/"Contrato assinado" já pode (api-v1.md:78).
- [ ] B+F — **Ver como cliente**: `GET /rentals/:id/customer-view` → `{rental, sections}` no formato do portal;
  front reaproveita `PortalRentalSummary`/`PortalRentalSections` com `readOnly`.
- [ ] F — "Copiar link do cliente" (URL do portal no domínio `app.cliente`).
- [ ] F — Card **CRLV do veículo** (de `GET /vehicles/:id` `documents[]`).
- [ ] F — Cobranças: anexos/comprovantes (`attachments[]` + `POST /documents ownerType=PAYMENT`), **QR do pix**
  (`pix.encodedImage`), multa/juros ou "a mais" também nas **pagas**.
- [ ] B — **Dia de cobrança** pronto: `billingDayLabel` ("Todo dia N" / "Todos os dias, exceto …") em
  `GET /rentals/:id` e `GET /me/rentals[/:id]` (o Next calcula em `lib/labels.ts:277`).
- [ ] F — Extrato respeita o período da conciliação (`?from=&through=` na tela e no PDF; o botão leva o período).
- [ ] F — Lista de locações abre filtrada em **Ativas** (como o Next).
- [ ] F — Nova locação: listar só veículos **disponíveis** (+ o atual na edição), como o Next (decidido).

## CRM, propostas, assinaturas e modelos

- [ ] F — Card **Propostas** no detalhe do lead (status, PDF, aceitar/recusar/excluir; vem em `GET /crm/leads/:id`).
- [ ] F — **"Copiar texto"** da proposta (WhatsApp) na lista/detalhe, no compositor e no lead (portar `htmlToText`).
- [ ] F — Renomear o PDF da proposta e os anexos das atividades do lead.
- [ ] F — Atribuição completa (referrer, landing, conteúdo, data, link da campanha), "Respondido em", origem com
  a campanha na tabela de leads.
- [ ] F — Mudar estágio/perdido direto na linha da lista de leads (decidido).
- [ ] F — Gerar novo link do questionário depois de respondido ou com o lead encerrado (decidido).
- [ ] B+F — **Links de campanha** (tela inteira): `GET/POST /crm/campaign-links`, `DELETE …/:id`,
  `POST …/:id/test-lead`, `channels[]` em `GET /crm/options`.
- [ ] B+F — **Apagar leads de teste**: `DELETE /crm/leads?test=true` → `{deleted}`.
- [ ] B+F — **Modelos de proposta** (tela inteira): CRUD de `/proposal-templates` (`?active=all`, detalhe com
  `bodyHtml` e `clauses`, POST/PUT/DELETE) + `GET /proposal-templates/variables`; aba nova em Modelos.
- [ ] B — Flag `aiEnabled` para esconder "Personalizar com IA" quando não há assistente (hoje dá 502).
- [ ] B+F — **Modelos de vistoria** com escrita: `POST /inspection-requirements`, `DELETE …/:id`;
  **cadência** editável: `PUT /inspection-policy`.
- [ ] F — Signatário: CPF da equipe (`GET /users/:id`) e contato de emergência do cliente como candidato.
- [ ] F — Vincular envelope: nº de documentos por envelope, ajuda com link para Integrações, só PDFs sem pedido vivo.

## Financeiro, empresa e shell

- [ ] F — "Dar baixa" direto na fila **A receber** (`POST /charges/:paymentId/settle`).
- [ ] B — `invoiceUrl` e `pix{payload, encodedImage}` nos itens de `GET /finance/to-collect` (copiar fatura/pix na fila).
- [ ] F — **Inadimplentes** completo com nº de cobranças, e **Top 5 que mais atrasam** (`topLatePayers` já vem).
- [ ] B+F — Taxa de inadimplência: `overdueRate` vindo do backend (decidido).
- [ ] F — Dívidas: "Pagar" em cada parcela (diálogo com a parcela pré-selecionada); leitura do código do boleto
  (portar `parseBoletoCode`, aviso de boleto já pago e de valor diferente); link para credor fornecedor/usuário;
  "Registrar pagamento" na linha; anexar ao criar.
- [ ] B — `createdByName` em `payments[]` de `GET /debts/:id`; `paymentCount`/`documentCount` nos itens de `GET /debts`.
- [ ] B+F — Prévia de juros no formulário de dívida e "saldo depois do pagamento" (`POST /debts/preview`) (decidido).
- [ ] B+F — **Extrato: exportar planilha** por conta + histórico de exportações (`POST/GET/DELETE
  /finance/statement/exports`) e **PDF oficial do banco** (`GET /finance/statement/bank-pdf`), com Bearer.
- [ ] B+F — **Empresa editável**: `PUT /company`.
- [ ] B+F — **Integrações** pelo webapp (decidido): listar/salvar (segredo em branco mantém), testar conexão, webhook do Inter.
- [ ] B+F — Histórico de **transferências emitidas**, só leitura (decidido): `GET /finance/transfers`.

## Portal do cliente

- [ ] F — Ver/baixar anexos de cobranças, reembolsos, manutenções e fotos de vistoria (`DocumentItem` +
  `useFileActions`).
- [ ] F — **Anexar documento numa manutenção existente** (`GET /me/document-categories?ownerType=MAINTENANCE`,
  `POST /me/rentals/:id/maintenances/:maintenanceId/documents`).
- [ ] F — Pix expirado: timer + "Regerar" (refetch relê no Asaas).
- [ ] F+B — "Faltam Y" e multa/juros sem depender de `paidAt`; B = `paidAt` das cobranças só do Asaas
  (`toPortalChargeDto` usa `row.payment?.paidAt`).
- [ ] F — Avisos de etapa (em preparação / aguardando caução / caução confirmada).
- [ ] F — "N em aberto", "N recusados"; separar locação atual × histórico.
- [ ] F — CRLV "ainda não disponível" com a locação ativa; selo "Registrada pela locadora" na manutenção.
- [ ] F — Vistoria nova em locação encerrada volta para a locação; pré-preencher a chave pix com o e-mail.
- [ ] F — Redirect `/area-cliente/senha` → `/area-cliente`.
- [ ] B — `personalDocuments` (documentos do cliente) em `GET /me/rentals/:id/sections`.
- [ ] B — Opcional: `GET /me/profile` (CPF/telefone para pré-preencher a carteira).

## Intencional (não fazer)

- Pix out, aprovar reembolso com transferência, "Sincronizar" transferência: o sistema nunca faz saída de dinheiro.
- Transições de status do veículo iguais às do backend (o Next mostrava todas e o servidor recusava).
- Sem subtítulo nas páginas; ações de proposta no detalhe (padrão Lista × Tabela); assinaturas por filtro de
  situação; ranking de manutenção sem os veículos sem atividade; "Emitir proposta" escondido com lead perdido.
