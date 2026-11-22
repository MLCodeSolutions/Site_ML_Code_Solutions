import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shotDir = "C:/Users/Mateus/AppData/Local/Temp/kilo/w5-g";
const EDGE = process.env.EDGE_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

const VIEWPORTS = [
  { key: "390", width: 390, height: 844 },
  { key: "768", width: 768, height: 1024 },
  { key: "1440", width: 1440, height: 900 },
];

const SECTIONS = [
  { key: "hero", file: "embed-hero.html", required: ["#inicio", ".marquee", ".stats-strip"] },
  { key: "problema", file: "embed-problema.html", required: ["#problema"] },
  { key: "servicos", file: "embed-servicos.html", required: ["#servicos"] },
  { key: "processo", file: "embed-processo.html", required: ["#processo", ".timeline"] },
  { key: "nichos-modelos", file: "embed-nichos-modelos.html", required: ["#nichos", "#modelos", "#catalogGrid"] },
  { key: "planos", file: "embed-planos.html", required: ["#planos", "#plansGrid"] },
  { key: "sobre-faq", file: "embed-sobre-faq.html", required: ["#sobre", "#faq", ".faq-list"] },
  { key: "contato", file: "embed-contato.html", required: ["#contato", "#legal", "footer.site-footer"] },
];
const ALL_SECTION_IDS = ["inicio", "problema", "servicos", "processo", "nichos", "modelos", "planos", "sobre", "faq", "contato", "legal"];

const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".png": "image/png", ".woff2": "font/woff2", ".json": "application/json", ".txt": "text/plain; charset=utf-8" };


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
    if (urlPath === "/favicon.ico") { res.writeHead(204); res.end(); return; }
    const file = path.join(root, urlPath);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("404");
      return;
    }
    res.writeHead(200, { "content-type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port })));
}

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const step = Math.max(320, Math.round(window.innerHeight * 0.8));
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    for (const scroller of document.querySelectorAll(".featured-grid")) {
      for (const cell of scroller.querySelectorAll(".model-cell")) {
        cell.scrollIntoView({ inline: "center", block: "nearest" });
        await new Promise((resolve) => setTimeout(resolve, 120));
      }
      scroller.scrollLeft = 0;
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(250);
}

const failures = [];
const results = [];
const check = (label, condition, detail) => {
  if (!condition) failures.push(label + (detail ? " :: " + detail : ""));
};

function attachLogging(page, bucket) {
  page.on("console", (message) => {
    if (message.type() === "error") bucket.console.push(message.text());
  });
  page.on("pageerror", (error) => bucket.console.push("pageerror: " + error.message));
  page.on("response", (response) => {
    if (response.status() >= 400 && !response.url().includes("favicon.ico")) bucket.failed.push(response.status() + " " + response.url());
  });
  page.on("requestfailed", (request) => {
    const url = request.url();
    if (url.includes("favicon.ico")) return;
    bucket.failed.push(url + " :: " + (request.failure() ? request.failure().errorText : "?"));
  });
}

async function baseChecks(page, label, sectionKey) {
  const info = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    docScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));
  check(label + " scroll horizontal", info.docScrollWidth <= info.innerWidth + 1 && info.bodyScrollWidth <= info.innerWidth + 1, JSON.stringify(info));
  await page.evaluate(() => window.scrollTo(0, 0));

  if (sectionKey) {
    const chrome = await page.evaluate(() => ({
      header: document.querySelectorAll(".site-header").length,
      fab: document.querySelectorAll(".wa-fab").length,
      mobile: document.querySelectorAll(".mobile-cta").length,
      cookie: document.querySelectorAll(".cookie-banner").length,
      modal: document.querySelectorAll("#previewModal").length,
      main: document.querySelectorAll("main#conteudo").length,
      sprite: document.querySelectorAll("symbol#i-wa").length,
      mode: document.body.getAttribute("data-embed-mode"),
      section: document.body.getAttribute("data-embed-section"),
    }));
    check(label + " chrome", chrome.header + chrome.fab + chrome.mobile + chrome.cookie + chrome.modal === 0, JSON.stringify(chrome));
    check(label + " main/sprite", chrome.main === 1 && chrome.sprite === 1, JSON.stringify(chrome));
    check(label + " modo secao", chrome.mode === "section" && chrome.section === sectionKey, JSON.stringify(chrome));
  } else {
    const chrome = await page.evaluate(() => ({
      header: document.querySelectorAll(".site-header").length,
      fab: document.querySelectorAll(".wa-fab").length,
      modal: document.querySelectorAll("#previewModal").length,
      mode: document.body.getAttribute("data-embed-mode"),
    }));
    check(label + " chrome do single", chrome.header === 1 && chrome.fab === 1 && chrome.modal === 1 && chrome.mode === "single", JSON.stringify(chrome));
  }
}

async function testCatalog(page, label, perPage, single) {
  const count = await page.locator("#catalogGrid .model-cell").count();
  check(label + " catalogo pagina 1", count === perPage, `esperado ${perPage}, obtido ${count}`);

  const next = page.locator("#catalogNext");
  if (await next.isVisible()) {
    await next.click();
    await page.waitForTimeout(250);
    const page2 = await page.locator("#catalogGrid .model-cell").count();
    check(label + " catalogo proxima pagina", page2 === perPage, `esperado ${perPage}, obtido ${page2}`);
    await page.locator("#catalogPrev").click();
    await page.waitForTimeout(250);
  }

  const tabs = page.locator("#catalogTabs .tab");
  const tabCount = await tabs.count();
  if (tabCount > 1) {
    await tabs.nth(1).click();
    await page.waitForTimeout(250);
    const filtered = await page.locator("#catalogGrid .model-cell").count();
    check(label + " filtro por nicho", filtered > 0 && filtered <= perPage, `obtido ${filtered}`);
    await page.locator('#catalogTabs .tab[data-nicho="Todos"]').click();
    await page.waitForTimeout(250);
  }

  const search = page.locator("#catalogSearch");
  await search.fill("casa");
  await page.waitForTimeout(350);
  const searchCount = await page.locator("#catalogGrid .model-cell").count();
  const countText = await page.locator("#catalogCount").innerText();
  check(label + " busca", searchCount > 0 && searchCount <= perPage && /encontrado/i.test(countText), `${searchCount} :: ${countText}`);
  await page.locator("#clearSearch").click();
  await page.waitForTimeout(350);
  const restored = await page.locator("#catalogCount").innerText();
  check(label + " busca limpa", /68 modelos prontos/.test(restored), restored);

  if (!single) {
    const preview = page.locator("#catalogGrid .model-preview").first();
    const tag = await preview.evaluate((el) => el.tagName);
    const href = await preview.getAttribute("href");
    const target = await preview.getAttribute("target");
    check(label + " link do modelo em secao", tag === "A" && /^https:/.test(href || "") && target === "_blank", `${tag} ${href} ${target}`);
    const modal = await page.locator("#previewModal").count();
    check(label + " sem modal em secao", modal === 0, String(modal));
  } else {
    await page.locator("#catalogGrid [data-preview]").first().click();
    await page.waitForTimeout(300);
    const open = await page.locator("#previewModal").getAttribute("aria-hidden");
    check(label + " modal abre", open === "false", String(open));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(250);
    const closed = await page.locator("#previewModal").getAttribute("aria-hidden");
    check(label + " modal fecha", closed === "true", String(closed));
  }

  await settle(page);
  const shots = await page.evaluate(() => Array.from(document.querySelectorAll("img.model-shot")).filter((img) => { const rect = img.getBoundingClientRect(); return rect.width > 0 && rect.height > 0; }).map((img) => ({ ok: img.complete && img.naturalWidth > 0, src: img.currentSrc || img.src })));
  const broken = shots.filter((shot) => !shot.ok);
  check(label + " prints carregados", shots.length > 0 && broken.length === 0, JSON.stringify(broken.slice(0, 3)));
}

async function testFaq(page, label) {
  const first = page.locator("details.faq-item").first();
  await first.locator("summary").click();
  await page.waitForTimeout(120);
  check(label + " FAQ abre", await first.evaluate((el) => el.open), "nao abriu");
  await first.locator("summary").click();
  await page.waitForTimeout(120);
  check(label + " FAQ fecha", !(await first.evaluate((el) => el.open)), "nao fechou");
}

async function testContact(page, label) {
  const wa = await page.locator('a[href^="https://wa.me/5512991956121"]').count();
  const mail = await page.locator('a[href^="mailto:projetos.mlcodesolutions@gmail.com"]').count();
  check(label + " links WhatsApp", wa >= 1, String(wa));
  check(label + " link de e-mail", mail >= 1, String(mail));
  const legalLinks = await page.locator('footer a[href="#privacidade"], footer a[href="#termos"]').count();
  check(label + " links legais no footer", legalLinks >= 2, String(legalLinks));
  await page.locator('footer a[href="#privacidade"]').first().click();
  await page.waitForTimeout(150);
  const open = await page.evaluate(() => Boolean(document.querySelector("#privacidade") && document.querySelector("#privacidade").open));
  check(label + " privacidade abre", open, "details nao abriu");
}

async function testSingleCatalog(page, label, width) {
  // No single o catalogo profundo fica abaixo; ainda assim o modal deve funcionar.
  const perPage = width >= 1024 ? 6 : width >= 700 ? 4 : 3;
  await testCatalog(page, label, perPage, true);
}

const { server, port } = await startServer();
const baseUrl = `http://127.0.0.1:${port}`;
fs.mkdirSync(shotDir, { recursive: true });
const browser = await chromium.launch({ executablePath: EDGE, headless: true });

try {
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, reducedMotion: "reduce" });
    await routeCdn(context);
    const labelBase = `${viewport.key}px`;

    for (const section of SECTIONS) {
      const bucket = { console: [], failed: [] };
      const page = await context.newPage();
      attachLogging(page, bucket);
      const label = `${section.file} @${labelBase}`;
      await page.goto(`${baseUrl}/dist/${section.file}`, { waitUntil: "load" });
      await settle(page);
      await baseChecks(page, label, section.key);
      for (const selector of section.required) {
        check(label + " secao presente " + selector, (await page.locator(selector).count()) > 0, "ausente");
      }
      const present = await page.evaluate((ids) => ids.filter((id) => document.getElementById(id)), ALL_SECTION_IDS);
      const extra = present.filter((id) => !section.required.some((selector) => selector === "#" + id));
      check(label + " somente a secao", extra.length === 0, "extras: " + extra.join(","));

      if (section.key === "nichos-modelos") {
        const perPage = viewport.width >= 1024 ? 6 : viewport.width >= 700 ? 4 : 3;
        await testCatalog(page, label, perPage, false);
      }
      if (section.key === "sobre-faq") await testFaq(page, label);
      if (section.key === "contato") await testContact(page, label);
      const shots = await page.evaluate(() => Array.from(document.querySelectorAll("img")).filter((img) => { const rect = img.getBoundingClientRect(); return rect.width > 0 && rect.height > 0; }).map((img) => ({ src: img.currentSrc || img.src, width: img.naturalWidth, complete: img.complete })));
      const brokenImgs = shots.filter((img) => img.src && !img.src.startsWith("data:") && (!img.complete || img.width === 0));
      check(label + " imagens carregadas", brokenImgs.length === 0, JSON.stringify(brokenImgs.slice(0, 3)));
      check(label + " console", bucket.console.length === 0, bucket.console.slice(0, 3).join(" | "));
      check(label + " requests", bucket.failed.length === 0, bucket.failed.slice(0, 3).join(" | "));

      if (viewport.key === "390" || viewport.key === "1440") {
        await page.waitForTimeout(2300);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: path.join(shotDir, `embed-${section.key}-${viewport.key}.png`), fullPage: true });
      }
      results.push({ label, consoleErrors: bucket.console.length, failedRequests: bucket.failed.length });
      await page.close();
    }

    const bucket = { console: [], failed: [] };
    const page = await context.newPage();
    attachLogging(page, bucket);
    const label = `embed.html @${labelBase}`;
    await page.goto(`${baseUrl}/dist/embed.html`, { waitUntil: "load" });
    await settle(page);
    await baseChecks(page, label, null);
    await testSingleCatalog(page, label, viewport.width);
    if (viewport.key === "1440") await testFaq(page, label + " faq");
    if (viewport.key === "1440") await testContact(page, label + " contato");
    check(label + " console", bucket.console.length === 0, bucket.console.slice(0, 3).join(" | "));
    check(label + " requests", bucket.failed.length === 0, bucket.failed.slice(0, 3).join(" | "));
    results.push({ label, consoleErrors: bucket.console.length, failedRequests: bucket.failed.length });
    await page.close();
    await context.close();
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

console.log("\nResumo por embed:");
for (const row of results) console.log(`- ${row.label}: console=${row.consoleErrors} requests=${row.failedRequests}`);
console.log(`\nScreenshots: ${shotDir}`);
if (failures.length) {
  console.error("\nFALHAS (" + failures.length + "):");
  failures.forEach((item) => console.error("- " + item));
  process.exit(1);
}
console.log("QA OK: 8 embeds por secao + single em 390/768/1440.");