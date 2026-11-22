import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "src", "js", "data.js"), "utf8");
const outDir = path.join(root, "prints");
fs.mkdirSync(outDir, { recursive: true });

const pattern = /\{\s*titulo:\s*"([^"]+)"\s*,\s*nicho:\s*"([^"]+)"\s*,\s*url:\s*"([^"]+)"/g;
const items = [];
let match;
while ((match = pattern.exec(html))) {
  items.push({ title: match[1], nicho: match[2], url: match[3] });
}

function slugOf(raw) {
  const parts = new URL(raw).pathname.split("/").filter(Boolean);
  const seg = parts[parts.length - 1] || "";
  return seg.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}

const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const browser = await chromium.launch({
  executablePath: edge,
  headless: true,
  args: ["--disable-gpu", "--hide-scrollbars", "--no-first-run", "--disable-background-networking"]
});

const failures = [];
const manifest = [];
let done = 0;

async function capture(item) {
  const slug = slugOf(item.url);
  const file = path.join(outDir, slug + ".jpg");
  if (!slug) throw new Error("slug vazio");
  if (fs.existsSync(file) && fs.statSync(file).size > 18000) {
    manifest.push({ ...item, image: slug + ".jpg", skipped: true });
    return;
  }

  let lastError = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 900 },
      deviceScaleFactor: 1,
      locale: "pt-BR",
      colorScheme: "light"
    });
    const page = await context.newPage();
    try {
      await page.goto(item.url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
      await page.waitForSelector(".zfr3Q, .M63kCb, [role='main']", { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2200 + attempt * 600);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);
      await page.screenshot({ path: file, type: "jpeg", quality: 72, fullPage: false });
      const size = fs.statSync(file).size;
      if (size < 18000) throw new Error("captura suspeita (" + size + " bytes)");
      manifest.push({ ...item, image: slug + ".jpg", skipped: false });
      await context.close();
      return;
    } catch (error) {
      lastError = error.message;
      await context.close().catch(() => {});
      if (attempt === 2) break;
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  failures.push(item.title + " | " + item.url + " | " + lastError);
}

const queue = [...items];
async function worker(id) {
  while (queue.length) {
    const item = queue.shift();
    try {
      await capture(item);
      done++;
      console.log(`[${done}/${items.length}] ${item.title}${failures.some((f) => f.startsWith(item.title + " |")) ? " (falhou)" : ""}`);
    } catch (error) {
      done++;
      failures.push(item.title + " | " + item.url + " | " + error.message);
      console.log(`[${done}/${items.length}] ${item.title} (falhou: ${error.message})`);
    }
  }
}

await Promise.all([worker(1), worker(2), worker(3)]);
await browser.close();

manifest.sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
if (failures.length) {
  fs.writeFileSync(path.join(outDir, "falhas.txt"), failures.join("\n"));
} else {
  try { fs.unlinkSync(path.join(outDir, "falhas.txt")); } catch {}
}
console.log(`Concluido. OK: ${manifest.length}. Falhas: ${failures.length}`);
