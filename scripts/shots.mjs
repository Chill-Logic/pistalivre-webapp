// Screenshots of the running dev app (Vite :5173 + API :3000), phone and
// desktop, to compare before/after a visual change.
//
//   npm run shots -- [--area gestao|cliente|parceiro] [--theme light|dark]
//                    [--out pasta] [--full] [--ai] caminho...
//
//   npm run shots -- /gestao /gestao/locacoes
//   npm run shots -- --area cliente --theme dark /area-cliente
//
// In Git Bash, prefix with MSYS_NO_PATHCONV=1 (otherwise "/gestao" becomes
// "C:/Program Files/Git/gestao"). Writes are blocked (answered 204 without
// reaching the API), so a screenshot never changes dev data. --ai answers
// GET /ai/me with the assistant switched on (the dev has no AI key).
// Puppeteer comes from ../pista-livre (not a dependency of this project).
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const puppeteer = require(resolve("../pista-livre/node_modules/puppeteer"));

const BASE = process.env.SHOTS_BASE_URL ?? "http://localhost:5173";
// Dev-only test logins (see CLAUDE.md).
const AREAS = {
  gestao: { login: "/gestao/entrar", user: "claude@dev.com", password: "Claude-tdnCSF8O" },
  cliente: { login: "/area-cliente/entrar", user: "demo4@demo.pistalivre.dev", password: "21508234973" },
  parceiro: { login: "/parceiro/entrar", user: "parceiro@dev.com.br", password: "ParceiroDev-2026" },
};
const SIZES = [
  ["celular", 390, 844],
  ["desktop", 1366, 820],
];

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const [value] = args.splice(i, 2).slice(1);
  return value;
};
const has = (name) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return false;
  args.splice(i, 1);
  return true;
};

const area = flag("area", "gestao");
const theme = flag("theme", "light");
const out = flag("out", `shots/${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}`);
const full = has("full");
const ai = has("ai");
const paths = args.length ? args : ["/gestao"];
const creds = AREAS[area];
if (!creds) throw new Error(`Área desconhecida: ${area}`);

mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ headless: true });

for (const [tag, width, height] of SIZES) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  await page.setRequestInterception(true);
  page.on("request", async (request) => {
    const url = request.url();
    if (ai && request.method() === "GET" && /\/ai\/me(\?|$)/.test(url)) {
      try {
        const res = await fetch(url, { headers: request.headers() });
        const body = await res.json();
        body.aiEnabled = true;
        if (!body.chatTools?.length) body.chatTools = ["buscar_tudo"];
        return request.respond({
          status: 200,
          contentType: "application/json",
          headers: { "access-control-allow-origin": "*" },
          body: JSON.stringify(body),
        });
      } catch {
        return request.continue();
      }
    }
    const reads = ["GET", "HEAD", "OPTIONS"].includes(request.method());
    if (reads || url.includes("/auth/")) return request.continue();
    return request.respond({ status: 204, body: "" });
  });

  await page.goto(BASE + creds.login, { waitUntil: "networkidle0" });
  await page.evaluate((value) => localStorage.setItem("pl:theme", value), theme);
  if (await page.$('input[type="password"]')) {
    await page.type("form input:not([type=password]):not([type=hidden]):not([type=checkbox])", creds.user);
    await page.type('input[type="password"]', creds.password);
    await page.keyboard.press("Enter");
    await page
      .waitForFunction(() => !location.pathname.endsWith("/entrar"), { timeout: 60000 })
      .catch(() => console.error(`login falhou (${area})`));
  }

  for (const path of paths) {
    await page.goto(BASE + path, { waitUntil: "networkidle0", timeout: 90000 }).catch(() => {});
    await page
      .waitForFunction(() => !document.querySelector(".animate-pulse"), { timeout: 90000 })
      .catch(() => console.error(`ainda carregando: ${path}`));
    // The TanStack devtools bubble sits on top of the assistant's corner.
    await page.evaluate(() =>
      document.querySelectorAll(".tsqd-parent-container").forEach((node) => node.remove()),
    );
    await new Promise((done) => setTimeout(done, 800));
    const name = `${path.replace(/^\//, "").replace(/\//g, "_") || "raiz"}-${tag}-${theme}.png`;
    await page.screenshot({ path: `${out}/${name}`, fullPage: full });
    console.log(`${out}/${name}`);
  }
  await page.close();
}
await browser.close();
