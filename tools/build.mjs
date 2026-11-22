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

const BUDGET_EMBED = 80 * 1024;
const BUDGET_CSS_GZ = 40 * 1024;
const BUDGET_JS_GZ = 30 * 1024;

const sri = (file) => "sha384-" + crypto.createHash("sha384").update(fs.readFileSync(file)).digest("base64");
const kb = (n) => (n / 1024).toFixed(1) + " KB";
const gz = (file) => zlib.gzipSync(fs.readFileSync(file)).length;

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

// ---------- CSS: bundle (@import) + minify ----------
await esbuild({
  entryPoints: [path.join(srcDir, "css", "main.css")],
  bundle: true,
  outfile: path.join(distDir, "main.css"),
  external: ["../../assets/*", "../../svg/*", "../../fonts/*"],
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

// ---------- HTML do embed ----------
let html = fs.readFileSync(path.join(srcDir, "index.html"), "utf8");

html = html
  .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
  .replace(/<meta name="(?:description|robots|author)"[^>]*>\s*/gi, "")
  .replace(/<meta property="og:[^"]*"[^>]*>\s*/gi, "")
  .replace(/<meta name="twitter:[^"]*"[^>]*>\s*/gi, "")
  .replace(/<link rel="canonical"[^>]*>\s*/gi, "")
  .replace(/<link rel="icon"[^>]*>\s*/gi, "")
  .replace(/<link rel="preconnect"[^>]*>\s*/gi, "")
  .replace(/<link rel="preload"[^>]*>\s*/gi, "")
  .replace(/<script type="application\/ld\+json"[\s\S]*?<\/script>\s*/i, "");

const htmlTag = dataBase
  ? `<html lang="pt-BR" class="js" data-base="${dataBase}">`
  : `<html lang="pt-BR" class="js">`;
html = html.replace(/<html lang="pt-BR"[^>]*>/, htmlTag);
html = html.replace(/<body>/, `<body data-embed-mode="single">`);

const cssTag = `<link rel="stylesheet" href="${cssHref}" integrity="${integrity["main.min.css"]}" crossorigin="anonymous">`;
const jsTag = `<script src="${jsSrc}" integrity="${integrity["main.min.js"]}" crossorigin="anonymous" defer></script>`;

if (!html.includes('<link rel="stylesheet" href="css/main.css">')) throw new Error("link de CSS nao encontrado");
if (!html.includes('<script type="module" src="js/main.js"></script>')) throw new Error("script de entrada nao encontrado");
html = html
  .replace('<link rel="stylesheet" href="css/main.css">', cssTag)
  .replace('<script type="module" src="js/main.js"></script>', jsTag);

const embed = await htmlMinify(html, {
  collapseWhitespace: true,
  conservativeCollapse: true,
  removeComments: true,
  removeRedundantAttributes: false,
  minifyCSS: false,
  minifyJS: false,
  keepClosingSlash: true,
  caseSensitive: true,
});
fs.writeFileSync(path.join(distDir, "embed.html"), embed);

// ---------- Relatorio / budgets ----------
const embedSize = fs.statSync(path.join(distDir, "embed.html")).size;
const cssSize = fs.statSync(cssFile).size;
const jsSize = fs.statSync(jsFile).size;
const cssGz = gz(cssFile);
const jsGz = gz(jsFile);

const failures = [];
if (embedSize > BUDGET_EMBED) failures.push(`embed.html ${kb(embedSize)} > ${kb(BUDGET_EMBED)}`);
if (cssGz > BUDGET_CSS_GZ) failures.push(`main.min.css gzip ${kb(cssGz)} > ${kb(BUDGET_CSS_GZ)}`);
if (jsGz > BUDGET_JS_GZ) failures.push(`main.min.js gzip ${kb(jsGz)} > ${kb(BUDGET_JS_GZ)}`);

console.log("base:", dataBase || "(local: ../prints)");
console.log("assets:", cdn ? cssHref + " | " + jsSrc : "(relativos, preview local)");
console.log(`embed.html      ${kb(embedSize).padStart(9)}`);
console.log(`main.min.css    ${kb(cssSize).padStart(9)}  gzip ${kb(cssGz)}`);
console.log(`main.min.js     ${kb(jsSize).padStart(9)}  gzip ${kb(jsGz)}`);
console.log("sha384 css:", integrity["main.min.css"]);
console.log("sha384 js: ", integrity["main.min.js"]);

if (failures.length) {
  console.error("BUDGET EXCEDIDO:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log("build OK");
