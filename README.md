# ML Code Solutions — embed para Google Sites

Este repositório contém o site institucional da **ML Code Solutions** empacotado para ser
incorporado no **Google Sites** via *Inserir → Incorporar → Código incorporado*. O site não é
publicado por GitHub Pages: a página vive no Google Sites, e o HTML/CSS/JS e os assets vêm deste
repositório por meio do **jsDelivr com tag imutável**.

O Google Sites não serve arquivos relativos nem aceita `src`/`href` relativos dentro do embed.
Por isso o build de produção injeta URLs absolutas do jsDelivr (`@v1.0.0`) com **SRI (sha384)** e
gera um HTML pronto para colar no bloco de código incorporado.

> **Estado atual (2026-11-22):** Fases 0–5 concluídas. Assets em `assets/`, zero
> `style=""`/`onerror`/`innerHTML`, URLs fixas em `data-base`, SRI e CSP (meta injetada pelo
> build) ativos. O build gera `dist/embed.html` (único) + os **8 embeds por seção**
> (`dist/embed-hero.html` … `dist/embed-contato.html`) e `npm run heights` grava
> `dist/heights.json` (390/768/1440). O spike no Google Sites (CSP/SRI dentro do iframe) segue
> pendente de publicação.

---

## 1. Como o site funciona

```text
Google Sites (documento publicado)
└── bloco "Código incorporado" (iframe)
    └── dist/embed-*.html  (8 embeds por seção)
        ├── <link> main.min.css   → https://cdn.jsdelivr.net/gh/...@v1.0.0/dist/main.min.css
        ├── <script> main.min.js  → https://cdn.jsdelivr.net/gh/...@v1.0.0/dist/main.min.js
        └── imagens/fontes/SVG    → https://cdn.jsdelivr.net/gh/...@v1.0.0/assets/...
```

- **Fonte única:** `src/index.html` + `src/css/*` + `src/js/*`. Nunca edite arquivos em `dist/`;
  eles são gerados e apagados a cada build.
- **Tag imutável:** cada release aponta para uma tag (`v1.0.0`, `v1.0.1`, ...). Nunca use
  `@main` nem `raw.githubusercontent.com` em produção: ambos mudam sem aviso e quebram o SRI.
- **Preview local:** `npm run preview` serve a fonte (`/src/index.html`) e o embed
  (`/dist/embed.html`) em `http://localhost:8080/`.

---

## 2. Estrutura do repositório

### Estado atual

```text
src/
  index.html              fonte legível (head com SEO para leitura local)
  css/
    main.css              apenas importa os módulos na ordem original
    00-tokens.css ... 17-perf-fonts.css   (18 módulos)
  js/
    main.js               entry → boot.js
    boot.js               orquestra a inicialização
    config.js             CONFIG (dados do negócio)
    data.js               SITES (68 modelos), NICHOS, NICHE_FALLBACK
    ui.js                 header, scroll, modal, consentimento, tracking
    catalog.js            catálogo, filtros, busca, paginação e modal de prévia
    sections.js           destaques, nichos, planos, urgência
    util.js               helpers (safeUrl, waLink, assetUrl, attachShot, ...)
assets/
  img/prints/            136 WebP (600/1200) + manifest + LEIA-ME
  img/og-1200x630.jpg    imagem de compartilhamento (SEO nativo)
  fonts/                 4 WOFF2 (Manrope/Syne latin + latin-ext)
  svg/                   logo, hero-art, covers/, problema/, empty, selo, aurora
tools/
  archive/prints-jpg/     68 JPG originais (fora do deploy)
  build.mjs               build do CSS/JS/HTML + SRI + budgets
  freeze.mjs              congela IDs/ordem/copy
  freeze.json             baseline congelado
  check.mjs               valida fonte, dados, prints, fontes e SVGs
  sri.mjs                 confere hashes SRI em dist
  preview.mjs             servidor local de preview
dist/                     gerado pelo build (não versionar como fonte)
  embed.html              embed único (compatibilidade)
  embed-hero.html         hero + marquee + stats
  embed-problema.html     problema
  embed-servicos.html     serviços
  embed-processo.html     processo + divisor
  embed-nichos-modelos.html  nichos + catálogo (68 modelos)
  embed-planos.html       planos + pagamento
  embed-sobre-faq.html    sobre + FAQ
  embed-contato.html      contato + legal + footer
  main.min.css
  main.min.js
  integrity.json
  heights.json            alturas medidas (npm run heights)
```

> **Divergência registrada (Fase 1):** o CSS foi dividido em **18 módulos** (`00-tokens.css` …
> `17-perf-fonts.css`), não nos 6 agrupamentos do plano. A ordem original da cascata é preservada
> por `main.css`; reagrupar mudaria a ordem e os overrides.

### Estrutura gerada (Fase 5)

```text
assets/
  svg/                    logo, hero-art, covers/<slug>.svg, problema/*, empty, selo, aurora
  img/prints/             <slug>-600.webp, <slug>-1200.webp (somente WebP)
  img/og-1200x630.jpg
  fonts/                  manrope-*.woff2, syne-*.woff2
dist/
  main.min.css
  main.min.js
  embed.html              embed único
  embed-hero.html
  embed-problema.html
  embed-servicos.html
  embed-processo.html
  embed-nichos-modelos.html
  embed-planos.html
  embed-sobre-faq.html
  embed-contato.html
  integrity.json          hashes SRI
  heights.json            alturas medidas em 390/768/1440 (npm run heights)
```

A mudança para `assets/` foi feita na **Fase 3**. A fonte usa `../assets/...`; o build reescreve
`../../assets/...` para `../assets/...` no CSS de `dist/`. Os 68 JPGs ficam em
`tools/archive/prints-jpg/` e não são publicados.

---

## 3. Requisitos

- **Node.js >= 20** (definido em `package.json` → `engines`).
- `npm ci` para instalar exatamente as versões de `package-lock.json`.
- Nenhuma dependência de runtime: o site final é HTML/CSS/JS estático.

---

## 4. Comandos

| Comando | O que faz |
|---|---|
| `npm ci` | Instala as dependências exatas do lockfile (CI e máquina limpa). |
| `npm run build` | Gera `dist/main.min.css`, `dist/main.min.js`, `dist/integrity.json`, `dist/embed.html` e os 8 `dist/embed-*.html` com URLs **relativas** (preview local). Aplica os budgets (cada embed < 80 KB; CSS gzip < 40 KB; JS gzip < 30 KB). |
| `npm run build:release` | Mesmo build, mas injeta URLs absolutas do jsDelivr com a tag `v1.0.0` (`--cdn=...@v1.0.0`) e SRI. Gera os 9 HTML (único + 8 seções) que vão para o Google Sites. |
| `npm run freeze` | Verifica se IDs, ordem de seções e copy continuam iguais ao baseline (`tools/freeze.json`). Falha em mudança não autorizada. |
| `npm run freeze -- --update` | Atualiza o baseline **somente** depois de uma mudança de copy aprovada. |
| `npm run check` | Valida sintaxe dos módulos JS, ausência de `<style>` inline, zero `style=""`/`onerror`/`innerHTML`, URLs `raw`/`@main`, JSON-LD, textos proibidos, 68 modelos/URLs únicas, prints WebP 600/1200, fontes, IDs duplicados, SVGs (viewBox, tamanho, reduced-motion), os 8 embeds (chrome proibido, CSP/SRI/preload) e `dist/heights.json` (8 seções x 3 viewports). |
| `npm run sri` | Confere se `dist/integrity.json` corresponde aos arquivos em `dist/` e se o `integrity` dos 9 HTML de embed está atualizado. |
| `npm run heights` | Mede as alturas dos 8 embeds em 390/768/1440 com Playwright + Edge, grava `dist/heights.json` e imprime a tabela markdown para o `docs/PUBLICAR.md`. |
| `npm run qa:embeds` | QA headless dos 8 embeds + único em 390/768/1440: console/requests, chrome, scroll horizontal, catálogo, modal, FAQ, links `wa.me` e prints. Gera screenshots em `%TEMP%/kilo/w5-g`. |
| `npm run preview` | Sobe um servidor local em `http://localhost:8080/` (porta opcional: `npm run preview -- 8081`). |

Fluxo mínimo antes de publicar:

```bash
npm ci
npm run build:release
npm run heights
npm run check
npm run freeze
npm run sri
```

> O `build:release` atual usa a tag fixa `v1.0.0` dentro do `package.json`. Para outra release,
> edite o script ou rode diretamente:
> `node tools/build.mjs --cdn=https://cdn.jsdelivr.net/gh/MLCodeSolutions/Site_ML_Code_Solutions@v1.0.1`

---

## 5. Como editar conteúdo

### 5.1 `CONFIG` — `src/js/config.js`

Objeto `CONFIG` com dados do negócio:

| Campo | Uso |
|---|---|
| `marca`, `slogan` | Nome e frase institucional. |
| `whatsapp` | Somente dígitos, formato `55DDDNÚMERO`. Base dos links `wa.me`. |
| `email` | Contato comercial exibido no site. |
| `siteUrl` | URL final publicada (usada em canonical/OG na fonte local). |
| `heroTrust`, `sobre`, `urgencia` | Textos de apoio. `urgencia.ativo` deve permanecer `false`. |
| `printsBase`, `printsCdn` | **Removidos na Fase 3.** A base dos prints vem de `data-base` (`assets/img/prints/`) ou do fallback local `../assets/img/prints/`. |
| `analytics` | `ga4`/`metaPixel` vazios por padrão. Só ativa com consentimento. |
| `seo` | Título/descrição/imagem usados apenas na fonte local. **O Google Sites ignora esses valores no embed.** |
| `whatsappMensagens` | Mensagens pré-preenchidas por contexto. |
| `planos` | Nome, preço, itens incluídos e não incluídos. |

### 5.2 `SITES` — `src/js/data.js`

- `SITES` é a lista dos **68 modelos**. Cada item tem `titulo`, `nicho`, `url` e `descricao`.
- `NICHOS` mapeia cada nicho para `slug`, `accent`, `accent2`, `icon`, `palette` e arte.
- `NICHE_FALLBACK`/`nicheMeta()` cobrem nichos novos sem configuração.
- O `slug` do nicho define a capa SVG (`assets/svg/covers/<slug>.svg`) e o prefixo dos prints
  (`<slug-do-modelo>-600.webp` e `-1200.webp` em `assets/img/prints/`).

Ao adicionar um modelo:

1. Inclua o objeto em `SITES` com uma URL única.
2. Garanta a capa SVG do nicho (ou o fallback `outros.svg`).
3. Gere os dois WebP do print (600 e 1200) e coloque em `assets/img/prints/`.
   Os JPGs de captura ficam em `tools/archive/prints-jpg/`, fora do deploy.
4. Rode `npm run check` — ele confere os 68 modelos, URLs únicas e prints WebP.

> **Congelamento:** `src/index.html` tem IDs, ordem de seções e copy congelados por
> `tools/freeze.json`. Mudanças de texto no HTML exigem `npm run freeze -- --update` e aprovação.
> Alterações em `CONFIG`/`SITES` (JS) não são cobertas pelo freeze.

---

## 6. Assets, imagens e fontes

### Estado atual (Fase 3)

- `assets/img/prints/`: 136 WebP (600/1200) + `manifest.json` + `LEIA-ME.txt`. O deploy usa
  **somente WebP**.
- `assets/fonts/`: 4 WOFF2 (Manrope e Syne, latin + latin-ext).
- `assets/svg/`: logo, hero-art, capas de nicho, ilustrações de “O problema”, estados
  vazios/selo/loading e `cta-aurora.svg`.
- `assets/img/og-1200x630.jpg`: imagem de compartilhamento usada pelo Google Sites.
- `tools/archive/prints-jpg/`: 68 JPG de captura/regeneração, fora do deploy.
- `BASE_URL` em `<html data-base="https://cdn.jsdelivr.net/gh/...@v1.0.0/assets/">`; o JS lê
  `document.documentElement.dataset.base` e a fonte local usa `../assets/`.

> **SVG externo e CSS:** um SVG carregado via `<img>` **não herda** variáveis CSS da página.
> Por isso as capas usam paleta fixa e a variação de cor acontece no chrome do card
> (`data-accent`/classes), não dentro do SVG.

---

## 7. Build, TAG e SRI

1. `tools/build.mjs`:
   - empacota e minifica `src/css/main.css` (esbuild + lightningcss);
   - empacota `src/js/main.js` em IIFE minificado (esbuild);
   - calcula `sha384` de CSS/JS e grava `dist/integrity.json`;
   - remove do HTML do embed `<title>`, `meta description/robots/author`, OG/Twitter,
     canonical, favicon, preconnect/preload e JSON-LD;
   - injeta `data-base`, `<link>`/`<script>` com `integrity` e `crossorigin="anonymous"`;
   - no release (`--cdn`/`--base`), troca `../assets/` do HTML pela base absoluta (jsDelivr/tag);
     no preview local mantém caminhos relativos.
2. `dist/embed.html` é o artefato a colar no Google Sites. **Não edite esse arquivo.**
3. Os 8 `dist/embed-*.html` são os artefatos por seção; `dist/embed.html` é o único de
   contingência.
4. `tools/heights.mjs` mede os embeds e grava `dist/heights.json`.
5. `npm run sri` garante que os hashes conferem com os arquivos e com os 9 HTML de embed.

Regras de tag:

- Tags são **imutáveis**. Nunca mova ou reutilize uma tag publicada.
- Se o CSS/JS mudar, o hash muda; **todos** os embeds precisam ser recolados com a nova tag/SRI.
- O jsDelivr pode levar alguns minutos para indexar uma tag recém-criada (404 inicial é normal).
- Valide antes de publicar:
  `https://cdn.jsdelivr.net/gh/MLCodeSolutions/Site_ML_Code_Solutions@v1.0.0/dist/main.min.css`
  e o equivalente `.../main.min.js`.

---

## 8. CSP implementada (Fase 3)

Cada embed leva uma `meta` CSP sem `'unsafe-inline'`, injetada por `tools/build.mjs`:

```text
default-src 'none';
script-src 'self' https://cdn.jsdelivr.net;
style-src 'self' https://cdn.jsdelivr.net;
img-src 'self' https://cdn.jsdelivr.net data:;
font-src 'self' https://cdn.jsdelivr.net;
connect-src 'none';
base-uri 'none';
form-action 'none';
object-src 'none'
```

Observações:

- `'self'` mantém o preview local funcionando; em produção o conteúdo vem do jsDelivr.
- Sem `frame-ancestors` e sem anti-framing (o conteúdo precisa rodar dentro do iframe do Sites).
- Analytics (GA4/Meta) fica desligado por padrão; se for ativado, exige uma variante de CSP com os
  domínios de script/connect/img e consentimento — e não suporta SRI.
- **O Google Sites pode remover ou ignorar a `meta` CSP.** O spike da Fase 3 vai confirmar isso.
  Se for ignorada, restam SRI, zero inline, URLs fixas e `safeUrl` como mitigações.
- **Zero inline:** `src/index.html` não tem `style=""`, `onerror` nem scripts inline;
  `src/js` não usa `innerHTML`; `src/` e `tools/` não referenciam `raw.githubusercontent.com` nem `@main`.

---

## 9. Limitações do Google Sites

- **SEO do embed não existe.** `<title>`, `meta description`, Open Graph/Twitter, canonical,
  favicon e JSON-LD dentro do iframe são ignorados. O build remove esses itens do embed.
- **SEO é nativo do Sites.** Título do site, descrição, URL amigável, favicon, imagem de
  compartilhamento e textos (`H1`, descrição, preço) precisam ser configurados no próprio Google
  Sites, fora do embed. Veja `docs/PUBLICAR.md`.
- **Sem controle de headers.** O domínio é do Google: não é possível definir HSTS,
  `X-Frame-Options`, `X-Content-Type-Options` ou uma CSP de resposta real para a página publicada.
- **Iframe sem auto-resize.** O Sites não redimensiona o iframe sozinho. As alturas são medidas por
  `npm run heights` e gravadas em `dist/heights.json`; cole o valor correspondente em cada bloco.
- **`position: fixed` dentro de iframe alto** não se comporta como na janela. Por isso o formato
  recomendado é **8 embeds por seção**; o embed único é contingência e cria rolagem dupla.
- **Rolagem:** no modo seção o iframe não tem scroll interno; no embed único, o scroll é interno ao
  iframe (janela do Sites + iframe = duas barras).
- **Lighthouse:** a nota é limitada pelo wrapper do Google Sites, independentemente da qualidade do
  embed. Meça sempre na URL publicada.

---

## 10. Atualizar uma release

1. Edite a fonte (`src/`).
2. Rode `npm run build:release` e `npm run heights`; depois `npm run check`, `npm run freeze` e
   `npm run sri`.
3. Crie uma **nova tag** imutável (ex.: `v1.0.1`).
4. Faça commit + push do commit e da tag.
5. Valide os arquivos no jsDelivr com a nova tag.
6. Recole **todos** os embeds no Google Sites (o CSS/JS compartilhado mudou de URL/hash).
7. Publique e teste em Chrome, Safari iOS e Android.

O passo a passo completo, com checklist de 11 etapas, tabela de alturas e ordem dos embeds, está em
[`docs/PUBLICAR.md`](docs/PUBLICAR.md).

---

## 11. Segurança manual do repositório

O CI roda build/check/freeze/SRI em push e pull request (`.github/workflows/ci.yml`); o restante é
**manual e obrigatório**:

- **2FA** na conta GitHub (e no e-mail associado).
- **Branch protection** em `main`: PR obrigatório, sem force-push, sem delete, revisão antes do merge.
- **Secret scanning** e **push protection** habilitados no repositório.
- **Dependabot** configurado em `.github/dependabot.yml` (npm semanal; GitHub Actions mensal).
- **Token nunca no repositório.** Use credenciais do sistema/SSH ou um token de curta duração no
  ambiente local. Se um token vazar, **revogue imediatamente** antes de qualquer push.
- Tags de release assinadas (recomendado) e histórico de tags preservado.
- Não commitar `node_modules/`, backups (`index.backup-*.html`), planilhas locais nem arquivos de
  design fora do escopo (já cobertos pelo `.gitignore`).

Detalhes de escopo e como reportar vulnerabilidades em [`SECURITY.md`](SECURITY.md).

---

## 12. Documentos relacionados

- [`SECURITY.md`](SECURITY.md) — escopo, versões suportadas e canal de reporte.
- [`docs/PUBLICAR.md`](docs/PUBLICAR.md) — checklist de publicação no Google Sites.
- [`.well-known/security.txt`](.well-known/security.txt) — arquivo documental (não servido na raiz
  do domínio do Google Sites).
