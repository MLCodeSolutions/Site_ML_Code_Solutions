# Relatório de QA — v1.0.1 (pré-publicação)

Data: 2026-11-22 · commits `4c1f1d1`, `52aa972`, `af43ca7`, `6336aa3`.
Ambiente: Windows, Edge (Playwright), servidor HTTP local, `reducedMotion: reduce`.
Todos os números foram medidos localmente; o spike no Google Sites ainda não foi executado.

## Antes → depois por critério

| Critério | Antes (diagnóstico) | Depois (medido) | Status |
|---|---|---|---|
| Embed único | 66,3 KB | 47,5 KB | ✅ <80 KB |
| CSS gzip | 16,2 KB | 15,6 KB | ✅ <40 KB |
| JS gzip | 18,6 KB | 16,1 KB | ✅ <30 KB |
| Embeds por seção | não existiam | 8 arquivos (8,9–14,3 KB) | ✅ |
| Covers SVG | inline/blobs | 8 externos, 4,7–5,0 KB | ✅ <6 KB |
| `style=""` / `onerror` / scripts inline | 27 styles, 1 onerror | 0 / 0 / 0 | ✅ |
| `<style>` inline | 0 | 1 hasheado (boot loader) | ✅ CSP |
| `innerHTML` em `src/js` | 3 | 0 (`svgNode` + `<template>`) | ✅ |
| URLs raw/`@main` | 13 raw + `@main` | 0 | ✅ |
| Fontes <12px | ~40 seletores | 0 (auditoria Playwright) | ✅ |
| Catálogo | carrossel de 3 páginas (3-up) | carrossel 1/2/3 por vez (mobile/tablet/desktop), swipe + setas + barra | ✅ |
| Cards | alturas variadas | uniformes, descrição 2 linhas | ✅ |
| CSS/código morto | preloader, film-grain, cta-orb/orbit, duplicatas | removido | ✅ |
| Chrome no modo seção | header/FAB/mobile CTA/modal | ausente (CSS + guards JS) | ✅ |
| Console/requests | — | 27/27 carregamentos com 0 erros / 0 falhas | ✅ |
| Scroll horizontal | — | 0 em 390/768/1440 (9 embeds) | ✅ |
| Links das 68 demos | — | 68/68 HTTP 200 | ✅ |
| Alturas medidas | — | 8 seções × 3 viewports, diferença ≤2 px | ✅ |
| SRI | — | `sha384` em CSS/JS, `crossorigin=anonymous` | ✅ |
| CSP | — | meta sem `'unsafe-inline'` nos 9 embeds; hash sha256 do boot loader | ✅ local |
| Copy/IDs | — | `freeze OK` 94 ids / 11 seções | ✅ |
| Prova social falsa | — | nenhum texto proibido no `check` | ✅ |

## Comandos executados

```bash
npm run build       # 9 HTML + CSS/JS minificados + integrity.json
npm run heights     # mede 8 seções em 390/768/1440 -> tools/heights.json + dist/heights.json
npm run check       # 8 módulos, 68 modelos, prints/fontes/SVGs, CSP/SRI, heights
npm run freeze      # 94 ids, 11 seções, copy intacta
npm run sri         # hashes conferem com dist e com os 9 HTML
npm run qa:embeds   # 27 carregamentos no Edge (8 embeds + único x 3 viewports)
```

## Alturas (px)

| Seção | 390 | 768 | 1440 |
|---|---:|---:|---:|
| Hero | 1427 | 1548 | 998 |
| Problema | 1767 | 1081 | 1065 |
| Serviços | 2157 | 1409 | 1368 |
| Processo | 1195 | 1046 | 1075 |
| Nichos + modelos | 2899 | 3667 | 3564 |
| Planos | 2650 | 1914 | 1996 |
| Sobre + FAQ | 2188 | 2027 | 2149 |
| Contato + legal | 2224 | 1863 | 2040 |

Copie o valor correspondente para o campo “altura” do bloco de código incorporado no Google Sites
(`dist/heights.json` é a fonte).

## Pendências (bloqueiam o release, não o código)

1. **Spike no Google Sites**: confirmar se a `meta` CSP e o SRI sobrevivem ao bloco “Código
   incorporado” e se os 8 iframes respeitam as alturas. Sem isso, não há como validar
   CSP/SRI/PageSpeed reais.
2. **Push/tag resolvidos**: `main` e as tags `v1.0.0` (commit `382b499`) e `v1.0.1` (catálogo em
   carrossel) estão publicados. O jsDelivr indexa as tags: CSS/JS/assets/heights retornam 200 e o
   sha384 confere com `integrity.json`; CI verde em `main` e nos PRs do Dependabot.
3. **PageSpeed/Lighthouse** na URL publicada (mobile/desktop) — depende do item 1.
4. **axe/WAVE** externos não foram executados (não instalados); foco, contraste, alvos e
   reduced-motion foram verificados via Playwright. O carrossel não usa dots: tem setas 44 px, swipe e
   barra de progresso, com label “Modelo X de 68”.
5. **SEO nativo do Sites** (nome, título, descrição, favicon, URL, imagem) é configurado no Google
   Sites, não no embed — ver `docs/PUBLICAR.md`.

## Release v1.0.1 publicada

`npm run build:release` foi executado com a tag `v1.0.1` e os 9 HTML foram verificados: `data-base`
absoluto em `...@v1.0.1/assets/`, CSS/JS com `integrity` igual a `dist/integrity.json`, CSP presente,
zero `../assets`, zero raw/`@main`. Os artefatos prontos para colar estão em `release/v1.0.1/`
(ignorada pelo git) e foram testados no Edge carregando CSS/JS/assets reais do jsDelivr, com console
limpo. O `dist/` local foi restaurado (`npm run build`) e o `check` segue OK.

## v1.0.2 — boot loader inline

- Os 9 embeds têm **1 `<style data-mlcs-boot>`**; o hash sha256 do conteúdo confere com o
  `style-src` da meta CSP. Nada de `'unsafe-inline'`.
- Com o CSS bloqueado/atrasado, o loader cobre o HTML cru; com o app pronto, `html.is-ready`
  esconde o loader. Sem JS, o fallback inline o esconde em 8 s.
- Testes Playwright em 390/1440 (single + `embed-nichos-modelos`): console limpo no caminho normal,
  `#catalogGrid` com 68 cards após o boot, loader `visibility:hidden/opacity:0`.
- Tamanhos: `embed.html` 50,9 KB; seções 12,3–17,7 KB; CSS gzip 15,7 KB; JS gzip 16,3 KB.
- Alturas (`heights.json`) inalteradas: o loader é `position:fixed`.

## Veredito

Código, build e release **v1.0.1**: **GO** (tag publicada, jsDelivr + SRI + CI validados). A
`v1.0.0` continua imutável; use a `v1.0.1` (catálogo em carrossel) nos novos embeds.
Falta apenas a publicação no Google Sites: spike de CSP/SRI/altura (item 1) e PageSpeed na URL
publicada (item 3), ambos com ação manual no Google Sites.
