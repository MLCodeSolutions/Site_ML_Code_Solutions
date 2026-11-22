import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transformSync } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const problems = [];
const notes = [];

const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(root, rel));

const html = read("src/index.html");
const jsDir = path.join(root, "src", "js");
const jsFiles = fs.readdirSync(jsDir).filter((f) => f.endsWith(".js"));
const jsSource = jsFiles.map((f) => fs.readFileSync(path.join(jsDir, f), "utf8")).join("\n");

// 1) Sintaxe de cada modulo (esbuild valida ESM)
for (const file of jsFiles) {
  try {
    transformSync(fs.readFileSync(path.join(jsDir, file), "utf8"), { loader: "js", format: "esm" });
  } catch (error) {
    problems.push(`Erro de sintaxe em src/js/${file}: ${error.message.split("\n")[0]}`);
  }
}

// 2) Zero inline na fonte: sem <style> e sem <script> com corpo
if (/<style[\s>]/i.test(html)) problems.push("src/index.html ainda tem bloco <style> inline");
const inlineScripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(
  ([, attrs, body]) => !/\bsrc=/.test(attrs) && body.trim().length > 0,
);
if (inlineScripts.length) {
  const ld = inlineScripts.filter(([, attrs]) => /application\/ld\+json/.test(attrs));
  if (inlineScripts.length - ld.length > 0) problems.push(`src/index.html tem ${inlineScripts.length - ld.length} script(s) inline executavel(is)`);
}

// 3) JSON-LD
const ld = html.match(/<script type="application\/ld\+json" id="structuredData">([\s\S]*?)<\/script>/);
if (!ld) problems.push("JSON-LD nao encontrado em src/index.html");
else {
  try { JSON.parse(ld[1]); } catch (error) { problems.push("JSON-LD invalido: " + error.message); }
}

// 4) Textos proibidos (html + js)
const forbidden = ["R$ 150", "150+", "a partir de R$", "50% na", "25% no", "Origem:", "Campanha:", "mshots", "promise-50", "Veterinarias a domicilio", "Clinica de Bolso", "Vet de Familia", "Iris Vet", "Orbita Vet", "Atelie de Bichos", "Agua e Sombra", "Plantao 24h", "Planta Tecnica", "Editorial Agua", "Suico Direto"];
const haystack = html + "\n" + jsSource;
for (const term of forbidden) if (haystack.includes(term)) problems.push("Texto proibido ainda presente: " + term);

// 5) 68 modelos e URLs unicas
const pattern = /\{\s*titulo:\s*"([^"]+)"\s*,\s*nicho:\s*"([^"]+)"\s*,\s*url:\s*"([^"]+)"/g;
const sites = [];
let match;
const dataJs = read("src/js/data.js");
while ((match = pattern.exec(dataJs))) sites.push({ title: match[1], niche: match[2], url: match[3] });
if (sites.length !== 68) problems.push("Esperados 68 modelos, encontrados " + sites.length);
const urls = new Set(sites.map((s) => s.url));
if (urls.size !== sites.length) problems.push("URLs de modelos duplicadas");
const titles = new Set(sites.map((s) => s.title));
if (titles.size !== sites.length) problems.push("Titulos de modelos duplicados");

// 6) Prints WebP 600/1200
const missing = [];
for (const site of sites) {
  let slug = "";
  try {
    const parts = new URL(site.url).pathname.split("/").filter(Boolean);
    slug = (parts[parts.length - 1] || "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  } catch {
    problems.push("URL invalida: " + site.url);
    continue;
  }
  for (const suffix of ["-600.webp", "-1200.webp"]) {
    if (!exists(path.join("assets", "img", "prints", slug + suffix))) missing.push(slug + suffix);
  }
}
if (missing.length) problems.push(`Prints WebP faltando (${missing.length}): ` + missing.slice(0, 8).join(", "));

// 7) Fontes / SVG / OG
for (const font of ["manrope-latin.woff2", "manrope-latin-ext.woff2", "syne-latin.woff2", "syne-latin-ext.woff2"]) {
  if (!exists(path.join("assets", "fonts", font))) problems.push("Fonte faltando (assets/fonts): " + font);
}
const ctaSvg = path.join(root, "assets", "svg", "cta-aurora.svg");
if (!fs.existsSync(ctaSvg)) problems.push("SVG do CTA faltando: assets/svg/cta-aurora.svg");
else {
  const svg = fs.readFileSync(ctaSvg, "utf8");
  if (!svg.includes("prefers-reduced-motion")) problems.push("SVG do CTA sem prefers-reduced-motion");
  if (svg.length > 40000) problems.push("SVG do CTA acima de 40 KB");
}
if (!exists("assets/img/og-1200x630.jpg")) problems.push("Imagem OG faltando: assets/img/og-1200x630.jpg");

// 8) IDs duplicados
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dupes.length) problems.push("IDs duplicados: " + [...new Set(dupes)].join(", "));

// 9) SVGs externos (covers + apoio)
const coverSlugs = [...dataJs.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
for (const slug of coverSlugs) {
  const rel = path.join("assets", "svg", "covers", slug + ".svg");
  if (!exists(rel)) { problems.push("Cover faltando: " + rel); continue; }
  const svg = read(rel);
  if (!svg.startsWith("<svg")) problems.push(`Cover ${rel} sem raiz <svg>`);
  if (!/viewBox="0 0 400 300"/.test(svg)) problems.push(`Cover ${rel} sem viewBox 400x300`);
  if (!svg.includes("prefers-reduced-motion")) problems.push(`Cover ${rel} sem prefers-reduced-motion`);
  if (Buffer.byteLength(svg) > 6144) problems.push(`Cover ${rel} acima de 6 KB`);
  if (/<image\b|href="https?:/.test(svg)) problems.push(`Cover ${rel} com dependencia externa`);
}
for (const rel of ["assets/svg/catalog-empty.svg", "assets/svg/selo-demonstracoes.svg", "assets/svg/image-loading.svg"]) {
  if (!exists(rel)) problems.push("SVG faltando: " + rel);
}
for (const rel of ["assets/svg/catalog-empty.svg", "assets/svg/selo-demonstracoes.svg"]) {
  if (exists(rel) && !read(rel).includes("prefers-reduced-motion")) problems.push(`SVG ${rel} sem prefers-reduced-motion`);
}
notes.push(`covers SVG: ${coverSlugs.length} (<= 6 KB cada)`);
// 9) Build: embed unico + 8 embeds por secao
const SECTION_EMBEDS = [
  ["embed-hero.html", "hero"],
  ["embed-problema.html", "problema"],
  ["embed-servicos.html", "servicos"],
  ["embed-processo.html", "processo"],
  ["embed-nichos-modelos.html", "nichos-modelos"],
  ["embed-planos.html", "planos"],
  ["embed-sobre-faq.html", "sobre-faq"],
  ["embed-contato.html", "contato"],
];
const CHROME_FORBIDDEN = ["site-header", "wa-fab", "mobile-cta", "cookie-banner", "previewModal", "skip-link", "vignette", "to-top", 'id="stars"'];
const VIEWPORTS = ["390", "768", "1440"];

if (exists("dist/embed.html")) {
  const embed = read("dist/embed.html");
  if (/<title>/i.test(embed)) problems.push("dist/embed.html ainda tem <title>");
  if (/application\/ld\+json/.test(embed)) problems.push("dist/embed.html ainda tem JSON-LD");
  if (/<style[\s>]/i.test(embed)) problems.push("dist/embed.html tem CSS inline");
  if (!/integrity="sha384-/.test(embed)) problems.push("dist/embed.html sem SRI");
  if (!/http-equiv="Content-Security-Policy"/.test(embed)) problems.push("dist/embed.html sem meta CSP");
  if (!/data-embed-mode="single"/.test(embed)) problems.push("dist/embed.html sem data-embed-mode=single");
  notes.push('dist/embed.html: ' + (Buffer.byteLength(embed) / 1024).toFixed(1) + " KB");
}

for (const [file, section] of SECTION_EMBEDS) {
  const rel = "dist/" + file;
  if (!exists(rel)) { problems.push("Embed faltando: " + rel + " (rode npm run build)"); continue; }
  const embed = read(rel);
  if (!/data-embed-mode="section"/.test(embed)) problems.push(rel + " sem data-embed-mode=section");
  if (!embed.includes('data-embed-section="' + section + '"')) problems.push(rel + " sem data-embed-section=" + section);
  if (!/<main id="conteudo">/.test(embed)) problems.push(rel + " sem main#conteudo");
  if (!/<symbol id="i-[a-z-]+"/.test(embed)) problems.push(rel + " sem sprite de icones");
  if (!/integrity="sha384-/.test(embed)) problems.push(rel + " sem SRI");
  if (!/crossorigin="anonymous"/.test(embed)) problems.push(rel + " sem crossorigin=anonymous");
  if (!/http-equiv="Content-Security-Policy"/.test(embed)) problems.push(rel + " sem meta CSP");
  if (!/<link rel="preload"[^>]*as="font"/.test(embed)) problems.push(rel + " sem preload de fonte");
  if (/<title>/i.test(embed)) problems.push(rel + " ainda tem <title>");
  if (/application\/ld\+json/.test(embed)) problems.push(rel + " ainda tem JSON-LD");
  if (/<style[\s>]/i.test(embed)) problems.push(rel + " tem CSS inline");
  for (const chrome of CHROME_FORBIDDEN) {
    if (embed.includes(chrome)) problems.push(rel + " tem chrome proibido: " + chrome);
  }
  notes.push(rel + ": " + (Buffer.byteLength(embed) / 1024).toFixed(1) + " KB");
}

if (!exists("dist/heights.json")) {
  problems.push("dist/heights.json ausente (rode npm run heights)");
} else {
  let heights = null;
  try { heights = JSON.parse(read("dist/heights.json")); } catch (error) { problems.push("dist/heights.json invalido: " + error.message); }
  if (heights) {
    for (const viewport of VIEWPORTS) {
      if (!heights.viewports || !heights.viewports[viewport]) problems.push("heights.json sem viewport " + viewport);
    }
    const sections = heights.sections || {};
    for (const [, section] of SECTION_EMBEDS) {
      const entry = sections[section];
      if (!entry) { problems.push("heights.json sem secao " + section); continue; }
      for (const viewport of VIEWPORTS) {
        if (!Number.isInteger(entry[viewport]) || entry[viewport] <= 0) problems.push('heights.json: ' + section + '/' + viewport + " invalido");
      }
    }
    const expected = SECTION_EMBEDS.map(([, section]) => section);
    const extra = Object.keys(sections).filter((key) => !expected.includes(key));
    if (extra.length) problems.push("heights.json com secao extra: " + extra.join(", "));
    notes.push("heights: " + expected.length + " secoes x " + VIEWPORTS.length + " viewports");
  }
}

// 10) Zero URLs moveis (raw/main) e zero inline/injecao de markup
const walk = (dir) => {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
};
const textExt = new Set([".html", ".css", ".js", ".mjs", ".ps1", ".json", ".txt"]);
const self = path.resolve(fileURLToPath(import.meta.url));
for (const dir of [path.join(root, "src"), path.join(root, "tools")]) {
  for (const file of walk(dir)) {
    if (!textExt.has(path.extname(file)) || path.resolve(file) === self) continue;
    if (file.includes(path.join("tools", "archive"))) continue;
    const rel = path.relative(root, file).replace(/\\/g, "/");
    const content = fs.readFileSync(file, "utf8");
    if (/raw\.githubusercontent\.com/.test(content)) problems.push("URL raw do GitHub em " + rel);
    if (new RegExp("@" + "main" + "\\b").test(content)) problems.push("Referencia movel em " + rel);
  }
}
if (/style="/.test(html)) problems.push("src/index.html ainda tem style=\"\" inline");
if (/\bonerror=/i.test(html)) problems.push("src/index.html ainda tem handler onerror inline");
if (/\binnerHTML\b/.test(jsSource)) problems.push("src/js ainda usa innerHTML");
if (problems.length) {
  console.log("PROBLEMAS:");
  problems.forEach((item) => console.log("- " + item));
  process.exit(1);
}
console.log(`OK: ${jsFiles.length} modulos, JSON-LD, textos, ${sites.length} modelos, prints WebP, fontes e SVGs validados.`);
notes.forEach((n) => console.log("- " + n));
