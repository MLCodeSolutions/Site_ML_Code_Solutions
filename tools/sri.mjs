import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");
const integrityFile = path.join(distDir, "integrity.json");
const embedFiles = fs.existsSync(distDir)
  ? fs.readdirSync(distDir).filter((file) => /^embed.*\.html$/.test(file)).sort()
  : [];

const problems = [];
if (!fs.existsSync(integrityFile)) problems.push("dist/integrity.json nao existe (rode npm run build)");
if (!embedFiles.includes("embed.html")) problems.push("dist/embed.html nao existe (rode npm run build)");
if (embedFiles.length < 9) problems.push(`esperados 9 HTML de embed (unico + 8 secoes), encontrados ${embedFiles.length}`);

if (!problems.length) {
  const integrity = JSON.parse(fs.readFileSync(integrityFile, "utf8"));

  for (const embedName of embedFiles) {
    const embed = fs.readFileSync(path.join(distDir, embedName), "utf8");
    for (const [file, hash] of Object.entries(integrity)) {
      if (!/^sha384-[A-Za-z0-9+/]+=*$/.test(hash)) problems.push(`hash invalido em ${file}: ${hash}`);
      if (!embed.includes(`integrity="${hash}"`)) problems.push(`${embedName} sem integrity atualizado para ${file}`);
    }
    if (!/crossorigin="anonymous"/.test(embed)) problems.push(`${embedName} sem crossorigin=anonymous`);
  }

  for (const [file, hash] of Object.entries(integrity)) {
    const target = path.join(distDir, file);
    if (!fs.existsSync(target)) continue;
    const actual = "sha384-" + (await import("node:crypto")).createHash("sha384").update(fs.readFileSync(target)).digest("base64");
    if (actual !== hash) problems.push(`integrity.json desatualizado para ${file}`);
  }

}

if (problems.length) {
  console.error("SRI: problemas encontrados");
  problems.forEach((p) => console.error("- " + p));
  process.exit(1);
}
console.log(`SRI OK: hashes conferem com dist e com ${embedFiles.length} HTML de embed`);
