import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");
const integrityFile = path.join(distDir, "integrity.json");
const embedFile = path.join(distDir, "embed.html");

const problems = [];
if (!fs.existsSync(integrityFile)) problems.push("dist/integrity.json nao existe (rode npm run build)");
if (!fs.existsSync(embedFile)) problems.push("dist/embed.html nao existe (rode npm run build)");

if (!problems.length) {
  const integrity = JSON.parse(fs.readFileSync(integrityFile, "utf8"));
  const embed = fs.readFileSync(embedFile, "utf8");

  for (const [file, hash] of Object.entries(integrity)) {
    if (!/^sha384-[A-Za-z0-9+/]+=*$/.test(hash)) problems.push(`hash invalido em ${file}: ${hash}`);
    if (!embed.includes(`integrity="${hash}"`)) problems.push(`embed.html sem integrity atualizado para ${file}`);
  }

  for (const [file, hash] of Object.entries(integrity)) {
    const target = path.join(distDir, file);
    if (!fs.existsSync(target)) continue;
    const actual = "sha384-" + (await import("node:crypto")).createHash("sha384").update(fs.readFileSync(target)).digest("base64");
    if (actual !== hash) problems.push(`integrity.json desatualizado para ${file}`);
  }

  if (!/crossorigin="anonymous"/.test(embed)) problems.push("tags sem crossorigin=anonymous");
}

if (problems.length) {
  console.error("SRI: problemas encontrados");
  problems.forEach((p) => console.error("- " + p));
  process.exit(1);
}
console.log("SRI OK: hashes conferem com dist e com embed.html");
