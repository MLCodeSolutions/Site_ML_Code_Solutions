import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import { transform as cssTransform } from "lightningcss";
import { minify as htmlMinify } from "html-minifier-terser";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "src");
const distDir = path.join(root, "dist");

const args = process.argv.slice(2);
const baseArg = args.find((a) => a.startsWith("--base="));
const cdnArg = args.find((a) => a.startsWith("--cdn="));
const baseUrl = baseArg ? baseArg.slice("--base=".length) : "";
const cdn = cdnArg ? cdnArg.slice("--cdn=".length).replace(/\/+$/, "") : "";
const dataBase = baseUrl || (cdn ? `${cdn}/assets/` : "");
const cssHref = cdn ? `${cdn}/dist/main.min.css` : "main.min.css";
const jsSrc = cdn ? `${cdn}/dist/main.min.js` : "main.min.js";
const assetHref = (relative) => (dataBase ? dataBase + relative : "../assets/" + relative);

const BUDGET_EMBED = 80 * 1024;
const BUDGET_CSS_GZ = 40 * 1024;
const BUDGET_JS_GZ = 30 * 1024;

const sri = (file) => "sha384-" + crypto.createHash("sha384").update(fs.readFileSync(file)).digest("base64");
const kb = (n) => (n / 1024).toFixed(1) + " KB";
const gz = (file) => zlib.gzipSync(fs.readFileSync(file)).length;

// 8 embeds por secao, na ordem de publicacao no Google Sites.
const SECTIONS = [
  { name: "hero", file: "embed-hero.html" },
  { name: "problema", file: "embed-problema.html" },
  { name: "servicos", file: "embed-servicos.html" },
  { name: "processo", file: "embed-processo.html" },
  { name: "nichos-modelos", file: "embed-nichos-modelos.html" },
  { name: "planos", file: "embed-planos.html" },
  { name: "sobre-faq", file: "embed-sobre-faq.html" },
  { name: "contato", file: "embed-contato.html" },
];

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

// ---------- CSS: bundle (@import) + minify ----------
await esbuild({
  entryPoints: [path.join(srcDir, "css", "main.css")],
  bundle: true,
  outfile: path.join(distDir, "main.css"),
  external: ["../../assets/*"],
  logLevel: "silent",
});

const cssIn = fs.readFileSync(path.join(distDir, "main.css"));
const transformed = cssTransform({ filename: "main.css", code: cssIn, minify: true });
// src/css usa ../../ (raiz do projeto); dist/main.min.css fica um nivel acima.
const cssMin = transformed.code.toString().replace(/url\((["']?)\.\.\/\.\.\//g, "url($1../");
fs.writeFileSync(path.join(distDir, "main.min.css"), cssMin);
fs.unlinkSync(path.join(distDir, "main.css"));

// ---------- JS: bundle ESM -> iife ----------
await esbuild({
  entryPoints: [path.join(srcDir, "js", "main.js")],
  bundle: true,
  outfile: path.join(distDir, "main.min.js"),
  format: "iife",
  target: ["es2020"],
  minify: true,
  legalComments: "none",
  logLevel: "silent",
});

const cssFile = path.join(distDir, "main.min.css");
const jsFile = path.join(distDir, "main.min.js");
const integrity = { "main.min.css": sri(cssFile), "main.min.js": sri(jsFile) };
fs.writeFileSync(path.join(distDir, "integrity.json"), JSON.stringify(integrity, null, 2) + "\n");

// ---------- HTML: pecas reutilizaveis ----------
const source = fs.readFileSync(path.join(srcDir, "index.html"), "utf8");

// CSP via <meta> (frame-ancestors nao funciona em meta; documentado em SECURITY.md).
const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${[
  "default-src 'none'",
  "script-src 'self' https://cdn.jsdelivr.net",
  "style-src 'self' https://cdn.jsdelivr.net",
  "img-src 'self' https://cdn.jsdelivr.net data:",
  "font-src 'self' https://cdn.jsdelivr.net",
  "connect-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'",
].join("; ")}">`;

const fontPreloads = ["manrope-latin.woff2", "syne-latin.woff2"]
  .map((font) => `<link rel="preload" href="${assetHref("fonts/" + font)}" as="font" type="font/woff2" crossorigin>`)
  .join("\n");

const cssTag = `<link rel="stylesheet" href="${cssHref}" integrity="${integrity["main.min.css"]}" crossorigin="anonymous">`;
const jsTag = `<script src="${jsSrc}" integrity="${integrity["main.min.js"]}" crossorigin="anonymous" defer></script>`;

const htmlTag = dataBase
  ? `<html lang="pt-BR" class="js" data-base="${dataBase}">`
  : `<html lang="pt-BR" class="js">`;

// ---------- Boot loader inline ----------
// Fica dentro do HTML para cobrir o primeiro paint (antes do CSS externo).
// E injetado depois da minificacao; o hash sha256 libera exatamente este <style> na CSP.
const BOOT_CSS = `
#mlcs-boot{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;overflow:hidden;overscroll-behavior:contain;background:radial-gradient(620px 420px at 50% 38%,rgba(168,85,247,.18),transparent 70%),radial-gradient(380px 280px at 50% 62%,rgba(232,121,249,.08),transparent 70%),#07030f;color:#f5edff;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;text-align:center;transition:opacity .28s ease,visibility 0s .28s;animation:mlcs-boot-fallback .3s ease 8s forwards}
#mlcs-boot::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(168,85,247,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,.06) 1px,transparent 1px);background-size:64px 64px;-webkit-mask-image:radial-gradient(70% 60% at 50% 50%,#000 30%,transparent 80%);mask-image:radial-gradient(70% 60% at 50% 50%,#000 30%,transparent 80%);pointer-events:none}
#mlcs-boot .mlcs-boot-inner{display:flex;flex-direction:column;align-items:center;gap:18px;transform:translateY(-2px)}
#mlcs-boot .mlcs-boot-mark{position:relative;display:grid;place-items:center;width:88px;height:88px;border-radius:50%;background:linear-gradient(150deg,rgba(168,85,247,.16),rgba(232,121,249,.06));border:1px solid rgba(168,85,247,.28);box-shadow:0 0 50px rgba(168,85,247,.22),inset 0 0 30px rgba(168,85,247,.08)}
#mlcs-boot .mlcs-boot-mark span{font-size:30px;font-weight:800;letter-spacing:-.06em;background:linear-gradient(100deg,#c084fc,#e879f9);-webkit-background-clip:text;background-clip:text;color:transparent;animation:mlcs-boot-pulse 2.4s ease-in-out infinite}
#mlcs-boot .mlcs-boot-ring{position:absolute;inset:-12px;border-radius:50%;border:2px solid rgba(168,85,247,.14);border-top-color:#a855f7;border-right-color:#e879f9;animation:mlcs-boot-spin 1.1s linear infinite}
#mlcs-boot .mlcs-boot-ring::after{content:"";position:absolute;top:-4px;left:50%;width:8px;height:8px;margin-left:-4px;border-radius:50%;background:#e879f9;box-shadow:0 0 12px #e879f9}
#mlcs-boot .mlcs-boot-text{margin:0;font-size:16px;font-weight:600;letter-spacing:.02em;color:#e9ddff}
#mlcs-boot .mlcs-boot-dots{display:inline-block;width:1.4em;text-align:left;animation:mlcs-boot-dots 1.4s steps(4,end) infinite}
#mlcs-boot .mlcs-boot-brand{font-size:11px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:#b9a8d4}
@keyframes mlcs-boot-spin{to{transform:rotate(360deg)}}
@keyframes mlcs-boot-pulse{0%,100%{opacity:.82;transform:scale(.97)}50%{opacity:1;transform:scale(1.03)}}
@keyframes mlcs-boot-dots{0%{clip-path:inset(0 100% 0 0)}25%{clip-path:inset(0 75% 0 0)}50%{clip-path:inset(0 50% 0 0)}75%{clip-path:inset(0 25% 0 0)}100%{clip-path:inset(0 0 0 0)}}
@keyframes mlcs-boot-fallback{to{opacity:0;visibility:hidden;pointer-events:none}}
@media (prefers-reduced-motion:reduce){#mlcs-boot .mlcs-boot-mark span,#mlcs-boot .mlcs-boot-ring,#mlcs-boot .mlcs-boot-dots{animation:none!important}#mlcs-boot .mlcs-boot-dots{clip-path:none}}
`;
const BOOT_HTML = `<div id="mlcs-boot" role="status" aria-live="polite" aria-label="Carregando o site"><div class="mlcs-boot-inner"><div class="mlcs-boot-mark" aria-hidden="true"><span>ML</span><i class="mlcs-boot-ring"></i></div><p class="mlcs-boot-text">Carregando<span class="mlcs-boot-dots" aria-hidden="true">...</span></p><small class="mlcs-boot-brand">ML Code Solutions</small></div></div>`;
const bootHash = "sha256-" + crypto.createHash("sha256").update(BOOT_CSS).digest("base64");
const BOOT_STYLE = `<style data-mlcs-boot>${BOOT_CSS}</style>`;

const minify = async (html) => {
  const out = await htmlMinify(html, {
    collapseWhitespace: true,
    conservativeCollapse: true,
    removeComments: true,
    removeRedundantAttributes: false,
    minifyCSS: false,
    minifyJS: false,
    keepClosingSlash: true,
    caseSensitive: true,
  });
  // Remove BOM herdado da fonte e espaco final; o embed vai para um textarea do Sites.
  return out.replace(/^\uFEFF/, "").trim() + "\n";
};

const toBase = (html) => (dataBase ? html.replace(/(src|href)="\.\.\/assets\//g, `$1="${dataBase}`) : html);

// Remove do embed tudo o que o Google Sites ignora (SEO/JSON-LD), mantendo fontes.
function stripSeoHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/<meta name="(?:description|robots|author)"[^>]*>\s*/gi, "")
    .replace(/<meta property="og:[^"]*"[^>]*>\s*/gi, "")
    .replace(/<meta name="twitter:[^"]*"[^>]*>\s*/gi, "")
    .replace(/<link rel="canonical"[^>]*>\s*/gi, "")
    .replace(/<link rel="icon"[^>]*>\s*/gi, "")
    .replace(/<link rel="preconnect"[^>]*>\s*/gi, "")
    .replace(/<script type="application\/ld\+json"[\s\S]*?<\/script>\s*/i, "");
}

function injectCsp(html) {
  if (!html.includes("<head>")) throw new Error("head nao encontrado para CSP");
  return html.replace(/<head>/, `<head>\n${cspMeta}`);
}

function swapAssetTags(html) {
  if (!html.includes('<link rel="stylesheet" href="css/main.css">')) throw new Error("link de CSS nao encontrado");
  if (!html.includes('<script type="module" src="js/main.js"></script>')) throw new Error("script de entrada nao encontrado");
  return html
    .replace('<link rel="stylesheet" href="css/main.css">', cssTag)
    .replace('<script type="module" src="js/main.js"></script>', jsTag);
}

// Injetado depois do minify para o hash bater exatamente com o <style> final.
function injectBoot(html) {
  const needle = "style-src 'self' https://cdn.jsdelivr.net";
  if (!html.includes(needle)) throw new Error("style-src nao encontrado para o loader");
  if (!html.includes("</head>")) throw new Error("head nao encontrado para o loader");
  if (!/<body[^>]*>/.test(html)) throw new Error("body nao encontrado para o loader");
  html = html.replace(needle, `${needle} '${bootHash}'`);
  html = html.replace("</head>", `${BOOT_STYLE}\n</head>`);
  return html.replace(/<body([^>]*)>/, `<body$1>${BOOT_HTML}`);
}

function stripStars(html) {
  return html.replace(/\s*<canvas id="stars"[^>]*><\/canvas>/i, "");
}

// ---------- HTML: sprite e blocos por secao ----------
const spriteMatch = source.match(/<svg class="svg-defs"[\s\S]*?<\/svg>/);
if (!spriteMatch) throw new Error("sprite de icones (.svg-defs) nao encontrado");
const sprite = spriteMatch[0];

function extractSection(id) {
  const start = source.search(new RegExp(`<section\\b[^>]*\\bid="${id}"`));
  if (start < 0) throw new Error(`secao #${id} nao encontrada`);
  const end = source.indexOf("</section>", start);
  if (end < 0) throw new Error(`fechamento da secao #${id} nao encontrado`);
  return source.slice(start, end + "</section>".length);
}

function extractDivider(afterIndex) {
  const start = source.indexOf('<div class="section-divider"', afterIndex);
  if (start < 0) throw new Error("divisor nao encontrado");
  const end = source.indexOf("</div>", start);
  if (end < 0) throw new Error("fechamento do divisor nao encontrado");
  return source.slice(start, end + "</div>".length);
}

const footerStart = source.indexOf('<footer class="site-footer"');
const footerEnd = source.indexOf("</footer>", footerStart);
if (footerStart < 0 || footerEnd < 0) throw new Error("footer nao encontrado");
const footer = source.slice(footerStart, footerEnd + "</footer>".length);

const heroStart = source.search(/<section\b[^>]*\bid="inicio"/);
const heroEnd = source.indexOf('<div class="section-divider"', heroStart);
if (heroStart < 0 || heroEnd < 0) throw new Error("bloco hero/marquee/stats nao encontrado");
const heroBlock = stripStars(source.slice(heroStart, heroEnd));

const processoSelf = extractSection("processo");
const processoBlock = processoSelf + "\n" + extractDivider(source.indexOf(processoSelf) + processoSelf.length);

const sectionBlocks = {
  hero: heroBlock,
  problema: extractSection("problema"),
  servicos: extractSection("servicos"),
  processo: processoBlock,
  "nichos-modelos": extractSection("nichos") + "\n" + extractSection("modelos"),
  planos: extractSection("planos"),
  "sobre-faq": extractSection("sobre") + "\n" + extractSection("faq"),
  contato: extractSection("contato") + "\n" + extractSection("legal") + "\n" + footer,
};

// Aviso minimo apenas onde o conteudo depende de JS (catalogo/planos).
const NOSCRIPT = '<noscript><div class="noscript-box"><strong>ML Code Solutions</strong><p>Ative o JavaScript para ver o conteudo completo.</p></div></noscript>';
const noscriptFor = (name) => (name === "nichos-modelos" || name === "planos" ? "\n" + NOSCRIPT : "");

async function buildSectionEmbed(name, blocks) {
  const html = `<!doctype html>
${htmlTag}
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${cspMeta}
${fontPreloads}
${cssTag}
</head>
<body data-embed-mode="section" data-embed-section="${name}">
${sprite}
<main id="conteudo">
${blocks}
</main>${noscriptFor(name)}
${jsTag}
</body>
</html>`;
  return injectBoot(await minify(toBase(html)));
}

// ---------- HTML: embed unico (compatibilidade) ----------
async function buildSingleEmbed() {
  let html = stripSeoHead(source);
  html = html.replace(/<html lang="pt-BR"[^>]*>/, htmlTag);
  html = html.replace(/<body>/, `<body data-embed-mode="single">`);
  // No release, `../assets/` nao resolve dentro do embed: troca pela base absoluta (jsDelivr/tag).
  html = toBase(html);
  html = injectCsp(html);
  html = swapAssetTags(html);
  return injectBoot(await minify(html));
}

// ---------- Escreve os HTML ----------
const singleFile = path.join(distDir, "embed.html");
const single = await buildSingleEmbed();
fs.writeFileSync(singleFile, single);

const written = [];
for (const { name, file } of SECTIONS) {
  const html = await buildSectionEmbed(name, sectionBlocks[name]);
  if (!html.includes('data-embed-mode="section"')) throw new Error(`${file}: modo secao ausente`);
  if (!html.includes('id="i-wa"')) throw new Error(`${file}: sprite de icones ausente`);
  fs.writeFileSync(path.join(distDir, file), html);
  written.push({ file, size: Buffer.byteLength(html) });
}

// ---------- Relatorio / budgets ----------
// heights.json medido fica versionado em tools/ e acompanha o build local.
// `npm run heights` remede e atualiza as duas copias.
const heightsSrc = path.join(root, "tools", "heights.json");
if (fs.existsSync(heightsSrc)) fs.copyFileSync(heightsSrc, path.join(distDir, "heights.json"));

const cssSize = fs.statSync(cssFile).size;
const jsSize = fs.statSync(jsFile).size;
const cssGz = gz(cssFile);
const jsGz = gz(jsFile);

const failures = [];
const embedSize = Buffer.byteLength(single);
if (embedSize > BUDGET_EMBED) failures.push(`embed.html ${kb(embedSize)} > ${kb(BUDGET_EMBED)}`);
for (const { file, size } of written) {
  if (size > BUDGET_EMBED) failures.push(`${file} ${kb(size)} > ${kb(BUDGET_EMBED)}`);
}
if (cssGz > BUDGET_CSS_GZ) failures.push(`main.min.css gzip ${kb(cssGz)} > ${kb(BUDGET_CSS_GZ)}`);
if (jsGz > BUDGET_JS_GZ) failures.push(`main.min.js gzip ${kb(jsGz)} > ${kb(BUDGET_JS_GZ)}`);

console.log("base:", dataBase || "(local: ../assets/)");
console.log("assets:", cdn ? cssHref + " | " + jsSrc : "(relativos, preview local)");
console.log(`embed.html      ${kb(embedSize).padStart(9)}  (unico)`);
for (const { file, size } of written) console.log(`${file.padEnd(27)} ${kb(size).padStart(9)}`);
console.log(`main.min.css    ${kb(cssSize).padStart(9)}  gzip ${kb(cssGz)}`);
console.log(`main.min.js     ${kb(jsSize).padStart(9)}  gzip ${kb(jsGz)}`);
console.log("sha384 css:", integrity["main.min.css"]);
console.log("sha384 js: ", integrity["main.min.js"]);

if (failures.length) {
  console.error("BUDGET EXCEDIDO:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log("build OK");