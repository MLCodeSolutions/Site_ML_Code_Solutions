import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "index.html");
const html = fs.readFileSync(file, "utf8");
const problems = [];

const scriptMatch = html.match(/<script>\s*'use strict';([\s\S]*?)<\/script>/);
if (!scriptMatch) problems.push("Script principal nao encontrado");
else {
  try { new Function(scriptMatch[1]); }
  catch (error) { problems.push("Erro de sintaxe no script: " + error.message); }
}

const ld = html.match(/<script type="application\/ld\+json" id="structuredData">([\s\S]*?)<\/script>/);
if (!ld) problems.push("JSON-LD nao encontrado");
else {
  try { JSON.parse(ld[1]); }
  catch (error) { problems.push("JSON-LD invalido: " + error.message); }
}

const forbidden = ["R$ 150", "150+", "a partir de R$", "50% na", "25% no", "Origem:", "Campanha:", "mshots", "promise-50", "Veterinarias a domicilio", "Clinica de Bolso", "Vet de Familia", "Iris Vet", "Orbita Vet", "Atelie de Bichos", "Agua e Sombra", "Plantao 24h", "Planta Tecnica", "Editorial Agua", "Suico Direto"];
forbidden.forEach((term) => {
  if (html.includes(term)) problems.push("Texto proibido ainda presente: " + term);
});

const pattern = /\{\s*titulo:\s*"([^"]+)"\s*,\s*nicho:\s*"([^"]+)"\s*,\s*url:\s*"([^"]+)"/g;
const sites = [];
let match;
while ((match = pattern.exec(html))) sites.push({ title: match[1], url: match[3] });
if (sites.length !== 68) problems.push("Esperados 68 modelos, encontrados " + sites.length);

const printsDir = path.join(root, "prints");
const missing = [];
for (const site of sites) {
  const parts = new URL(site.url).pathname.split("/").filter(Boolean);
  const slug = (parts[parts.length - 1] || "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  for (const suffix of [".jpg", "-600.webp", "-1200.webp"]) {
    const image = path.join(printsDir, slug + suffix);
    if (!fs.existsSync(image)) missing.push(slug + suffix);
  }
}
if (missing.length) problems.push("Prints faltando (" + missing.length + "): " + missing.join(", "));

for (const font of ["manrope-latin.woff2", "manrope-latin-ext.woff2", "syne-latin.woff2", "syne-latin-ext.woff2"]) {
  if (!fs.existsSync(path.join(root, "fonts", font))) problems.push("Fonte faltando: " + font);
}

const ctaSvg = path.join(root, "svg", "cta-aurora.svg");
if (!fs.existsSync(ctaSvg)) problems.push("SVG do CTA faltando: svg/cta-aurora.svg");
else {
  const svg = fs.readFileSync(ctaSvg, "utf8");
  if (!svg.includes("prefers-reduced-motion")) problems.push("SVG do CTA sem prefers-reduced-motion");
  if (svg.length > 40000) problems.push("SVG do CTA acima de 40 KB");
}
if (!fs.existsSync(path.join(root, "capa-og-1200x630.jpg"))) problems.push("Imagem OG faltando: capa-og-1200x630.jpg");

if (problems.length) {
  console.log("PROBLEMAS:");
  problems.forEach((item) => console.log("- " + item));
  process.exit(1);
}
console.log("OK: script, JSON-LD, textos, " + sites.length + " modelos e prints validados.");
