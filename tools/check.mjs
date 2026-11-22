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
    if (!exists(path.join("prints", slug + suffix))) missing.push(slug + suffix);
  }
}
if (missing.length) problems.push(`Prints WebP faltando (${missing.length}): ` + missing.slice(0, 8).join(", "));

// 7) Fontes / SVG / OG
for (const font of ["manrope-latin.woff2", "manrope-latin-ext.woff2", "syne-latin.woff2", "syne-latin-ext.woff2"]) {
  if (!exists(path.join("fonts", font))) problems.push("Fonte faltando: " + font);
}
const ctaSvg = path.join(root, "svg", "cta-aurora.svg");
if (!fs.existsSync(ctaSvg)) problems.push("SVG do CTA faltando: svg/cta-aurora.svg");
else {
  const svg = fs.readFileSync(ctaSvg, "utf8");
  if (!svg.includes("prefers-reduced-motion")) problems.push("SVG do CTA sem prefers-reduced-motion");
  if (svg.length > 40000) problems.push("SVG do CTA acima de 40 KB");
}
if (!exists("capa-og-1200x630.jpg")) problems.push("Imagem OG faltando: capa-og-1200x630.jpg");

// 8) IDs duplicados
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dupes.length) problems.push("IDs duplicados: " + [...new Set(dupes)].join(", "));

// 9) Build (quando existir): embed sem title/JSON-LD/style inline
if (exists("dist/embed.html")) {
  const embed = read("dist/embed.html");
  if (/<title>/i.test(embed)) problems.push("dist/embed.html ainda tem <title>");
  if (/application\/ld\+json/.test(embed)) problems.push("dist/embed.html ainda tem JSON-LD");
  if (/<style[\s>]/i.test(embed)) problems.push("dist/embed.html tem CSS inline");
  if (!/integrity="sha384-/.test(embed)) problems.push("dist/embed.html sem SRI");
  notes.push(`dist/embed.html: ${(Buffer.byteLength(embed) / 1024).toFixed(1)} KB`);
}

if (problems.length) {
  console.log("PROBLEMAS:");
  problems.forEach((item) => console.log("- " + item));
  process.exit(1);
}
console.log(`OK: ${jsFiles.length} modulos, JSON-LD, textos, ${sites.length} modelos, prints WebP, fontes e SVGs validados.`);
notes.forEach((n) => console.log("- " + n));
