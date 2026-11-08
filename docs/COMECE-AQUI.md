# Comece aqui — pistalivre-webapp

Resumo para a próxima sessão. Atualizado em **2026-11-08**. O histórico completo fica em `docs/handoff.md`, as
regras em `CLAUDE.md` e o contrato da API em `../pista-livre/docs/api-v1.md`. **Fale com o dono sempre em
português do Brasil**, inclusive nas frases curtas entre ferramentas e nos relatórios de subagentes.

## O que está no ar

| O quê | Onde |
|---|---|
| Webapp, equipe | https://app.gestao.pistalivrelocacoes.com.br |
| Webapp, portal do cliente | https://app.cliente.pistalivrelocacoes.com.br |
| Webapp, endereço da Vercel | https://pistalivre-webapp.vercel.app (as duas áreas) |
| Backend (Next + `/api/v1`) | https://pistalivrelocacoes.com.br (Railway publica a `main` do `pista-livre`) |
| Site antigo (telas Next) | `pistalivrelocacoes.com.br/gestao` e `/area-cliente`, **seguem no ar** |

- Um build do webapp serve as duas áreas. O app procura `gestao`/`cliente` no endereço (`helpers/host-realm`) e
  manda a página da outra área para o domínio certo. Em `localhost` e no endereço da Vercel, as duas áreas
  funcionam.
- Backend no ar desde 2026-11-08 13:28 (merge `df0985f` da `feat/api-v1-spa` na `main`).
  `WEBAPP_ORIGIN` = app.gestao, app.cliente e pistalivre-webapp.vercel.app.
- O webapp tem **tudo** da gestão e do portal, inclusive as escritas de dinheiro (entrada). Nunca há saída de
  dinheiro (pix out, transferência, boleto): é sempre por fora.

## Rodar local

- WSL: `npm`/`node`/`npx` "curtos" travam. Use `/home/ojhon/.nvm/versions/node/v22.15.1/bin/{node,npm,npx}`.
- API: `docker compose up dev` no `../pista-livre` (:3000). **Não derrubar.** Para trocar variável de ambiente,
  recriar com `docker compose up -d --no-deps --no-build dev` (o `restart` não relê a env).
- Front: `node node_modules/vite/bin/vite.js --host --port 5173 --strictPort`. No WSL o Vite às vezes não percebe um
  arquivo alterado: dê `touch` no arquivo.
- Logins do dev: `admin@pistalivre.dev` / `admin123` e portal `cliente.teste@pistalivre.dev` / `teste123` (5 erros =
  15 min de bloqueio). Dados de demonstração: clientes "Demo" (`docker compose exec dev npm run db:seed:demo`, já
  rodado).

## Publicar (só quando o dono pedir)

- **Webapp:** `/home/ojhon/.nvm/versions/node/v22.15.1/bin/vercel deploy --prod` na pasta do projeto (já ligada em
  `.vercel/`, conta `csjhonathan`). O GitHub **não** está conectado à Vercel (falta liberar o app da Vercel na org
  Chill-Logic e rodar `vercel git connect`), então um push **não** publica.
- **Backend:** juntar a `feat/api-v1-spa` na `main` do `pista-livre`, e o Railway publica sozinho (~9 min). Antes,
  conferir se a branch está toda no GitHub (`git rev-list origin/feat/api-v1-spa..feat/api-v1-spa`): no dia 8
  havia 13 commits só locais. A sessão de backend agora envia a branch a cada entrega.
- Commit e push na `main` deste repo podem, **mas** se o dono disser "só sobe quando eu pedir", nem commitar.

## Regras que mais pegam

- Zero HTML nativo fora de `components/atoms` (grep no CLAUDE.md), Row/Col (nunca `grid-cols-*`),
  Radix/shadcn (nada de select ou date nativo), skeleton no formato real, sem subtítulo em página.
- **Dinheiro só no servidor**: o front não subtrai nem calcula juros (use os campos que a API manda).
- Escritas que emitem cobrança, baixa, NF ou pagamento levam `Idempotency-Key` (`hooks/ui/useIdempotencyKey`).
  Erros: `helpers/money-errors` (`PROVIDER_ERROR` mostra o motivo do Asaas; `NOT_RECORDED` não reenvia).
- Testes visuais: Puppeteer do `../pista-livre/node_modules/puppeteer`, em 390×844 e 1366×820, com **escritas
  simuladas** e scripts e prints **no scratchpad**, nunca na pasta do projeto.
- **Várias sessões na mesma pasta compartilham o índice do git**: `git add <caminhos>` **e** `git commit <caminhos>`
  (no zsh, liste os caminhos num array). Senão o commit leva o que outra sessão deixou no stage.
- Ao abrir subagentes/forks: pedir que respondam **em português**.

## Pendências

**Decisão do dono**
- Remover as telas Next antigas, depois de ele aprovar o site novo.
- Prévia de juros no formulário de dívida (o Next calcula no navegador): pedir um endpoint de prévia ao backend,
  se ele quiser.
- Aumentar a memória do servidor de dev (`NODE_OPTIONS` no compose): ele caiu uma vez compilando rotas.
- Apagar o `cnh.pdf` falso (14 bytes) do cliente `cmulg283b0009qlt88apl8nd5` no dev.

**Pode fazer sem decisão**
- **Endereços limpos** (follow-up pedido pelo dono): tirar `/gestao` e `/area-cliente` dos caminhos nos domínios
  app.gestao/app.cliente. Receita no CLAUDE.md, seção "Deploy (Vercel) e domínios".
- "Tornar assinável" nos cards de documento (hoje a assinatura só começa pela lista de Assinaturas).
- Portal: anexar arquivo numa manutenção que já existe (a rota existe no backend).
- "Visualizar PDF" da proposta: mostrar o motivo quando o servidor recusar (hoje sai uma mensagem genérica).

**Testar à mão (num navegador de verdade)**
- Portal: trocar o tipo da vistoria para "Leitura de km" (o Puppeteer não conseguiu).
- Portal com dados reais: o `cliente.teste` não tem locação, então extrato e escritas da locação foram testados com
  simulação.
- Enviar assinatura de ponta a ponta (dispara e-mail real pelo Clicksign).

## Sessões

- Backend: `pista-livre-99` (pode ter mudado de nome, veja com ListAgents). Contrato por mensagem, com o formato
  exato do endpoint.
- Quem roda os serviços: `chill-logic-78`.
