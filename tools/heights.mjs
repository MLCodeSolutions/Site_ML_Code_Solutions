import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");
const outFile = path.join(distDir, "heights.json");
const baseFile = path.join(root, "tools", "heights.json");

const EDGE = process.env.EDGE_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
if (!fs.existsSync(EDGE)) {
  console.error("Edge nao encontrado em " + EDGE + " (defina EDGE_PATH).");
  process.exit(1);
}

const VIEWPORTS = [
  { key: "390", width: 390, height: 844 },
  { key: "768", width: 768, height: 1024 },
  { key: "1440", width: 1440, height: 900 },
];

const EMBEDS = [
  { key: "hero", file: "embed-hero.html", label: "Hero (`embed-hero`)" },
  { key: "problema", file: "embed-problema.html", label: "Problema (`embed-problema`)" },
  { key: "servicos", file: "embed-servicos.html", label: "Serviços (`embed-servicos`)" },
  { key: "processo", file: "embed-processo.html", label: "Processo (`embed-processo`)" },
  { key: "nichos-modelos", file: "embed-nichos-modelos.html", label: "Nichos + modelos (`embed-nichos-modelos`)" },
  { key: "planos", file: "embed-planos.html", label: "Planos (`embed-planos`)" },
  { key: "sobre-faq", file: "embed-sobre-faq.html", label: "Sobre + FAQ (`embed-sobre-faq`)" },
  { key: "contato", file: "embed-contato.html", label: "Contato + legal (`embed-contato`)" },
];
const SINGLE = { key: "single", file: "embed.html", label: "Embed único (`embed`)" };

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
};


// Permite medir/QA tanto o build local quanto o --cdn: serve os arquivos do
// jsDelivr a partir do repositorio local, preservando os bytes do SRI.
async function routeCdn(context) {
  await context.route("https://cdn.jsdelivr.net/**", (route) => {
    const pathname = new URL(route.request().url()).pathname;
    const match = pathname.match(/@[^/]+\/(.+)$/);
    if (!match) { route.abort(); return; }
    const file = path.join(root, decodeURIComponent(match[1]));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      route.fulfill({ status: 404, contentType: "text/plain", body: "404" });
      return;
    }
    route.fulfill({
      status: 200,
      contentType: MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
      body: fs.readFileSync(file),
    });
  });
}

function startServer() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const file = path.join(root, urlPath);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("404");
      return;
    }
    res.writeHead(200, { "content-type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

const settle = async (page) => {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const step = Math.max(320, Math.round(window.innerHeight * 0.8));
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 90));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(250);
};

const measure = (page) => page.evaluate(() => {
  const docHeight = document.documentElement.scrollHeight;
  const bodyHeight = Math.ceil(document.body.getBoundingClientRect().height);
  return { docHeight, bodyHeight, height: Math.max(docHeight, bodyHeight) };
});

async function measureEmbed(context, baseUrl, file) {
  const result = {};
  for (const viewport of VIEWPORTS) {
    const page = await context.newPage();
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.goto(`${baseUrl}/dist/${file}`, { waitUntil: "load" });
    await settle(page);
    const first = await measure(page);
    await settle(page);
    const second = await measure(page);
    const stable = Math.abs(first.height - second.height) <= 2;
    const height = Math.max(first.height, second.height);
    if (!stable) {
      console.warn(`  aviso: ${file} @${viewport.key} instavel (${first.height} -> ${second.height}); usando ${height}`);
    }
    if (errors.length) console.warn(`  aviso: ${file} @${viewport.key} erro JS: ${errors[0]}`);
    result[viewport.key] = height;
    await page.close();
  }
  return result;
}

const { server, port } = await startServer();
const baseUrl = `http://127.0.0.1:${port}`;
const browser = await chromium.launch({ executablePath: EDGE, headless: true });

try {
  const result = {
    generatedAt: new Date().toISOString(),
    viewports: Object.fromEntries(VIEWPORTS.map((v) => [v.key, { width: v.width, height: v.height }])),
    sections: {},
    single: {},
  };

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  await routeCdn(context);

  for (const embed of EMBEDS) {
    console.log(`medindo ${embed.file}...`);
    result.sections[embed.key] = await measureEmbed(context, baseUrl, embed.file);
  }
  console.log(`medindo ${SINGLE.file}...`);
  result.single = await measureEmbed(context, baseUrl, SINGLE.file);
  await context.close();

  fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + "\n");
  fs.writeFileSync(baseFile, JSON.stringify(result, null, 2) + "\n");

  const header = `| Seção | 390 px | 768 px | 1440 px |\n|---|---:|---:|---:|`;
  const rows = EMBEDS.map((embed) => `| ${embed.label} | ${result.sections[embed.key]["390"]} | ${result.sections[embed.key]["768"]} | ${result.sections[embed.key]["1440"]} |`);
  console.log("\n" + header + "\n" + rows.join("\n"));
  console.log(`\n${SINGLE.label}: ${result.single["390"]} / ${result.single["768"]} / ${result.single["1440"]} px (scroll interno; nao usar na tabela)`);
  console.log(`heights: ${path.relative(root, outFile)}`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}