import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.argv[2] || 8080);
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
};

const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);
  if (url === "/") {
    res.writeHead(200, { "content-type": MIME[".html"] });
    res.end(
      `<!doctype html><meta charset="utf-8"><title>MLCS preview</title>
<body style="font:16px/1.6 system-ui;background:#07030f;color:#eee;padding:2rem">
<h1>Preview local</h1>
<ul><li><a style="color:#c084fc" href="/src/index.html">Fonte (/src/index.html)</a></li>
<li><a style="color:#c084fc" href="/dist/embed.html">embed.html</a></li>
<li><a style="color:#c084fc" href="/dist/embed-hero.html">embed-hero.html</a></li>
<li><a style="color:#c084fc" href="/dist/embed-problema.html">embed-problema.html</a></li>
<li><a style="color:#c084fc" href="/dist/embed-servicos.html">embed-servicos.html</a></li>
<li><a style="color:#c084fc" href="/dist/embed-processo.html">embed-processo.html</a></li>
<li><a style="color:#c084fc" href="/dist/embed-nichos-modelos.html">embed-nichos-modelos.html</a></li>
<li><a style="color:#c084fc" href="/dist/embed-planos.html">embed-planos.html</a></li>
<li><a style="color:#c084fc" href="/dist/embed-sobre-faq.html">embed-sobre-faq.html</a></li>
<li><a style="color:#c084fc" href="/dist/embed-contato.html">embed-contato.html</a></li></ul>
</body>`,
    );
    return;
  }
  const file = path.join(root, url);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("404");
    return;
  }
  res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

server.listen(port, () => {
  console.log(`preview: http://localhost:${port}/  (fonte em /src, embed em /dist)`);
});
