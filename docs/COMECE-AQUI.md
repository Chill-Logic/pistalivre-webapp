# Comece aqui — pistalivre-webapp

Resumo para a próxima sessão. Atualizado em **2026-11-08 (fim do dia)**. O histórico completo fica em
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
- **Integrações (Asaas, Inter, Clicksign) só admin**: agente vê só a situação (decisão do dono).

## O que está no ar

| O quê | Onde |
|---|---|
| Webapp, equipe | https://app.gestao.pistalivrelocacoes.com.br |
| Webapp, portal do cliente | https://app.cliente.pistalivrelocacoes.com.br |
| Webapp, endereço da Vercel | https://pistalivre-webapp.vercel.app (as duas áreas) |
| Backend (Next + `/api/v1`) | https://pistalivrelocacoes.com.br (Railway publica a `main` do `pista-livre`) |
| Site antigo (telas Next) | `pistalivrelocacoes.com.br/gestao` e `/area-cliente`, **seguem no ar** |

- Um build do webapp serve as duas áreas. O app procura `gestao`/`cliente` no endereço (`helpers/host-realm`) e
  manda a página da outra área para o domínio certo. Em `localhost` e no endereço da Vercel, as duas áreas funcionam.
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
- **Webapp:** `/home/ojhon/.nvm/versions/node/v22.15.1/bin/vercel deploy --prod` na pasta do projeto (já ligada em
  `.vercel/`, conta `csjhonathan`). O GitHub **não** está conectado à Vercel, então um push **não** publica.
- Commit e push na `main` deste repo podem, **mas** se o dono disser "só sobe quando eu pedir", nem commitar.

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
- Remover as telas Next antigas, depois de ele aprovar o site novo.
- **Endereços limpos**: tirar `/gestao` e `/area-cliente` dos caminhos nos domínios app.gestao/app.cliente
  (receita no CLAUDE.md, seção "Deploy (Vercel) e domínios").
- Aumentar a memória do servidor de dev (`NODE_OPTIONS` no compose).
- Apagar o `cnh.pdf` falso (14 bytes) do cliente `cmulg283b0009qlt88apl8nd5` no dev.

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
