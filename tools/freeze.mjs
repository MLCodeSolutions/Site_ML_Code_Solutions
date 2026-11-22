import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlFile = path.join(root, "src", "index.html");
const freezeFile = path.join(root, "tools", "freeze.json");
const update = process.argv.includes("--update");

const html = fs.readFileSync(htmlFile, "utf8");

const normalize = (text) =>
  text
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const hash = (text) => crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const sectionMatches = [...html.matchAll(/<section\b[^>]*\sid="([^"]+)"/g)];

const sections = {};
for (let i = 0; i < sectionMatches.length; i++) {
  const start = sectionMatches[i].index;
  const end = i + 1 < sectionMatches.length ? sectionMatches[i + 1].index : html.indexOf("</main>", start);
  const chunk = html.slice(start, end > start ? end : html.length);
  sections[sectionMatches[i][1]] = { hash: hash(normalize(chunk)), chars: normalize(chunk).length };
}

const bodyText = normalize(html.slice(html.indexOf("<body"), html.lastIndexOf("</body>")));

const snapshot = {
  version: 1,
  generatedAt: new Date().toISOString(),
  ids,
  sections: Object.fromEntries(Object.entries(sections).map(([k, v]) => [k, v.hash])),
  textHash: hash(bodyText),
  chars: bodyText.length,
};


if (update || !fs.existsSync(freezeFile)) {
  fs.writeFileSync(freezeFile, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`freeze: baseline criado (${ids.length} ids, ${sectionMatches.length} secoes, ${snapshot.chars} chars)`);
  process.exit(0);
}

const base = JSON.parse(fs.readFileSync(freezeFile, "utf8"));
const problems = [];

const baseIds = base.ids;
for (const id of baseIds) if (!ids.includes(id)) problems.push(`id removido: #${id}`);
for (const id of ids) if (!baseIds.includes(id)) problems.push(`id novo: #${id}`);
if (baseIds.join(",") !== ids.join(",") && !problems.length) problems.push("ordem de ids alterada");

const baseSections = Object.keys(base.sections);
const nowSections = Object.keys(snapshot.sections);
for (const s of baseSections) if (!nowSections.includes(s)) problems.push(`secao removida: #${s}`);
for (const s of nowSections) if (!baseSections.includes(s)) problems.push(`secao nova: #${s}`);
if (baseSections.join(",") !== nowSections.join(",")) problems.push("ordem de secoes alterada");

for (const [name, h] of Object.entries(base.sections)) {
  if (snapshot.sections[name] && snapshot.sections[name] !== h) problems.push(`copy alterada em #${name}`);
}
if (base.textHash !== snapshot.textHash) problems.push("copy global alterada");

if (problems.length) {
  console.error("FREEZE: mudancas nao autorizadas detectadas");
  problems.forEach((p) => console.error("- " + p));
  console.error("\nSe a mudanca foi aprovada, rode: npm run freeze -- --update");
  process.exit(1);
}

console.log(`freeze OK: ${ids.length} ids, ${sectionMatches.length} secoes, copy intacta`);
