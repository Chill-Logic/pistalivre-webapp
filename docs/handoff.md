# Handoff — pistalivre-webapp

Documento vivo para a sessão (Claude) que assumir o frontend. Atualize ao passar o bastão.

## Contexto e autonomia

- O dono pediu para **sair do monolito**: este SPA consome a API `/api/v1` servida pelo Next do repo `pista-livre` (branch `feat/api-v1-spa`, mantida por uma sessão de backend, cujo handoff fica em `pista-livre/docs/handoff-api-v1.md`).
- Ele deu **autonomia** para seguir sem perguntar enquanto estiver fora, e pediu que, ao fim do contexto, o trabalho seja **repassado a uma sessão livre do frontend** (`pista-livre-38`, `pista-livre-dd` ou outra ociosa no ListAgents; hoje quem está no front é a `pista-livre-48`), com a mesma instrução: continuar trabalhando e repassar adiante. Quem assume avisa o par do backend com o novo nome.
- Regras combinadas com o backend:
  1. Nada vai para produção: sem deploy, sem domínio público. Aqui, commit e push na `main` deste repo podem.
  2. Não derrubar o container `dev` (:3000) nem o Vite (:5173); o dono usa os dois para olhar.
  3. Contrato por mensagem: peça o endpoint ao backend com o formato exato.
  4. Ao chegar perto do fim do contexto, atualizar este arquivo e repassar.
  5. Decisão ambígua: escolher o mais conservador, anotar aqui e seguir. Exceção: o que mexe em **dinheiro** (emitir, dar baixa ou editar cobrança, pix) ou em **dado de cliente** fica **somente leitura** até o dono decidir.
  6. Escopo: reproduzir no SPA as telas da gestão e depois as do portal. Apagar as páginas Next antigas só com o aval dele.

## Trabalho em paralelo

- A `pista-livre-5d` voltou a trabalhar no webapp **em paralelo** (2026-11-07), na **mesma pasta**: ela ficou com o item 1 (criar/editar veículo; já instalou `@radix-ui/react-popover` e `cmdk`). Commits só com os seus arquivos (`git add <caminhos>`, nunca `-A`), `git pull --rebase` antes do push, mudanças aditivas nos arquivos compartilhados (router, pages.ts, query-keys, routes, label-maps).

## Rodando

- API: `docker compose up dev` no `pista-livre` (já está de pé; **não reinicie**). Login `admin@pistalivre.dev` / `admin123`.
- Front: `node node_modules/vite/bin/vite.js --host --port 5173 --strictPort` (no WSL, `npm`/`node` são funções nvm que travam: use os binários em `/home/ojhon/.nvm/versions/node/v22.15.1/bin/`).
- Testes visuais: Puppeteer do `pista-livre/node_modules/puppeteer` (o Chrome dele está em `~/.cache/puppeteer`), em 390×844 (mobile) e 1366×820 (desktop).

## Regras do dono (inegociáveis)

- **Zero HTML nativo fora de `components/atoms`**, garantido pelo lint (`no-restricted-syntax`). Também não vale UI que o navegador desenha (`<select>` nativo foi rejeitado): use Radix/shadcn.
- **Nada de função solta**: `utils/` (pura), `helpers/` (depende do app), `hooks/` (depende do React).
- **Toda tela de dados tem skeleton no formato real**: `XSkeleton` exportado no mesmo arquivo do organism, page e skeleton pelo mesmo template, tudo dentro de `SkeletonRegion`. Refetch = lista esmaecida + `TopProgressBar`, nunca skeleton por cima de dado.
- **Layout com `Row`/`Col`** (grid de 12 colunas do dalila-ui, em `src/index.css`), nunca `grid-cols-*`.
- **Menu colapsável** no modelo do dalila-ui (`SidebarProvider`/`useSidebar`).
- Mobile first, PWA, interface em português, código em inglês, brand (`#E4141B`, regra 60/30/10).
- Sem saudação duplicada: "Olá, Fulano" só no header.
- **Sem subtítulo em página** ("acho muito feio"): o `PageHeader` só tem título e ações, sem `description`. Texto explicativo de estado vazio pode.

## Feito

- Base: Vite + React 19 + TanStack Query 5 + Router 7 + Tailwind 3 + PWA (prompt de atualização, banner offline).
- Auth da equipe por Bearer (`/auth/login`, `/auth/me`), guards com `callbackUrl`.
- Veículos: lista (busca, tipo da API, situação, paginação na URL, km e locatário) + detalhe (resumo, locação ativa, documentos com ver/baixar via blob).
- Shell: sidebar colapsável, gaveta no mobile, barra inferior, tema claro/escuro/sistema.
- Loaders: skeletons, barra de topo, páginas lazy.
- Locações: lista + detalhe, com cobranças **somente leitura** (`amounts.amount` da API; vencido por status ou por data em Brasília; copiar pix; abrir fatura).
- Rótulos vêm de `GET /labels` (o shell espera o catálogo carregar).
- Painel (`/dashboard`): KPIs (saldo `null` = "Indisponível"; saldo parcial diz qual fonte faltou), inadimplência por finalidade, maiores devedores, funil e origem dos leads, frota, manutenções por tipo/serviço/veículo, séries mensais e o ranking de manutenção por veículo (só os que têm atividade, com nota de quantos ficaram fora). Gráficos são **CSS puro** (atom `Meter`, molecules `BarList`/`ColumnChart`), sem biblioteca: nada de HTML fora dos atoms e bundle leve. No gráfico mensal o mês se escolhe **tocando** (tooltip de hover não funciona no celular).
- Manutenções e vistorias: listas (busca, tipo; vistoria também por quem fez) + detalhes (manutenção: serviços com especificação, "paga pelo locatário", anexos; vistoria: itens verificados OK/problema/sem resposta e fotos por requisito, "Não enviada" quando faltou). Ficam só na sidebar/gaveta: a barra inferior mantém os 5 destinos do dia a dia (`MAIN_NAV` × `SIDEBAR_NAV`). O dev **não tem vistoria**: o detalhe foi validado com resposta simulada no Puppeteer (interceptação de request).
- **Portal do cliente** (`/area-cliente`, login em `/area-cliente/entrar` por e-mail ou CPF): guards por **realm** (`RequireAuth realm`/`RedirectIfAuthenticated realm`, `helpers/safe-redirect`): sem sessão → login do realm com `callbackUrl`; sessão do outro realm → home dele (staff em /area-cliente cai em /gestao e vice-versa); `callbackUrl` de outra área é ignorado. Shell próprio (`PortalShell`: coluna única max-w-3xl, sem sidebar). Home = hub (locações, cobranças com copiar pix/QR sob demanda/fatura, NFs autorizadas, reembolsos com recusado em destaque — 5 no máximo —, carteira). Locação = resumo + caução + seções do `/sections` (a divulgação progressiva é do servidor). Cada seção carrega e falha sozinha (`QueryBoundary`). **Só leitura**: sem pedir reembolso, cadastrar chave pix, registrar manutenção/vistoria nem trocar senha (escritas do portal ficam para o dono decidir).
  - ⚠️ **Não há cliente de teste com senha no dev** (o backend não cria por ser credencial/dado de cliente). O portal foi validado com **respostas simuladas** (`/me/*` e `/auth/me` interceptados no Puppeteer, nos formatos reais que o backend viu no dev) + o login real com senha errada. Pendência para o dono: indicar/criar um cliente de teste.
  - Tema claro/escuro mantido no portal, igual ao Next (o CLAUDE.md anota a dúvida de travar o portal no claro; decisão do dono).
- Veículo — **trocar situação e excluir**: card "Situação" com só as transições legais (`constants/vehicle.ts`, espelho da regra do domínio), cada uma confirmada em Dialog (para "Alugado" o texto avisa que normalmente isso vem de ativar uma locação); avisa quando há locação ativa mas a situação gravada é outra. "Excluir" no topo do detalhe, Dialog destrutivo, volta para a lista. `Dialog` (atom, bottom sheet no celular) + `ConfirmDialog` (molecule) prontos para reuso. Testado: AVAILABLE→MAINTENANCE→AVAILABLE no PLA-1001 (dado voltou ao original); exclusão testada com o DELETE simulado (nenhum veículo apagado).
- Ficha do veículo e da locação mostram as **manutenções e vistorias** dela (`RelatedMaintenances`/`RelatedInspections`, carregam sozinhas com `?vehicleId=`/`?rentalId=`, até 100).
- **Criar/editar veículo** (`/gestao/veiculos/novo`, `/gestao/veiculos/:id/editar`; "Novo veículo" na lista e "Editar" no detalhe): mesmos campos do form Next, inclusive "Valor da tarifa"/"Período da tarifa", que o `PUT` ainda exige (o `GET /vehicles/:id` passou a devolver `rate`/`ratePeriod`, senão a edição sobrescreveria a tarifa). Tipo filtra categoria; marca filtra modelo; marca/modelo/ano em combobox criável (Popover + cmdk, "Usar “X”"), enviados por NOME. Erros da API nos campos via `applyApiErrors` (422 `fields`; 409 de placa/chassi/renavam também vem com `fields`). Testado sem gravar: placa repetida contra a API real (409, nada criado); sucesso de POST/PUT simulado.
- Celular: `scroll-padding-bottom` no `html` para a barra inferior fixa não cobrir o que o navegador rola para a vista (foco, validação). Um toque no "Cadastrar" caía em "Locações".
- **Financeiro, visão geral** (`/gestao/financeiro`): saldos (`null` = "Indisponível"), "A receber" agrupado por dia de vencimento (Hoje/Ontem/"29 de agosto" + dias de atraso + subtotal) e inadimplência (cards + por finalidade + maiores devedores). Cada bloco usa o seu `QueryBoundary`, então uma fonte fora do ar não derruba as outras. "Vencido em aberto" diz que é o **valor original**, porque "A receber" mostra o devido hoje (com multa e juros) e lado a lado pareciam divergir.
- Clientes: lista (busca, situação, filtro de teste; padrão = só reais) + detalhe (dados, CNH com aviso de vencida, endereço e emergência, locações, documentos). O locatário na locação leva à ficha. `DocumentsCard` é genérico (veículo e cliente).

## Organização (pedido do dono)

- `pages/`, `hooks/api/` e `services/api/` são divididos **por domínio**: `gestao/`, `cliente/` e `comum/`. Os **componentes são compartilhados** (`components/` único).
- URLs: `/gestao/...` (login em `/gestao/entrar`) e `/area-cliente/...` para o portal; `/` redireciona para `/gestao`.

## Próximo (em ordem)

1. **Financeiro, só leitura** (endpoints em `pista-livre/docs/api-v1.md`, seção "Financeiro"): visão geral **feita**. Faltam **Débitos da empresa** (`/debts`, `/debts/:id`: o selo `status` vem pronto, não derive) e o **Extrato** (`/finance/statement`: período, origem, `truncated` → "(parcial)", `sources[].error` por origem). Nota e transferência interna do extrato são escrita: ficam de fora (regra 5).
2. Escritas do portal e de dinheiro, e criar/editar cliente: **só com o dono** (o cliente faz upsert no Asaas).

## Pendências e decisões anotadas

- Logo `public/logo.svg` é provisório (um "P"); troque e rode `npm run pwa:assets`.
- No dev, o S3 está com credencial quebrada: abrir/baixar documento dá 500 (problema anterior a este trabalho).
- Barra inferior no mobile **mantida** junto com a gaveta (decisão minha; o dalila só tem a gaveta). Se o dono preferir, basta tirar `<BottomNav />` do `AppShell`.
- **Divergência de dinheiro, já existente** (anotada pelo backend): a caução vencida aparece como R$ 730,16 na visão da equipe (multa e juros calculados localmente) e como R$ 650 no `/me/charges` (read-through do Asaas). As telas Next fazem igual. Decisão do dono.
- **Datas**: `paidAt` das cobranças também é data de calendário (meia-noite UTC), então use `formatCalendarDate`. Com `formatDate` (Brasília) ele volta um dia.
