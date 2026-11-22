# Política de segurança — ML Code Solutions

Este documento cobre a segurança do **código-fonte deste repositório** e dos **embeds publicados
no Google Sites** (HTML/CSS/JS estáticos servidos pelo jsDelivr). Ele não cobre a infraestrutura do
Google Sites, do jsDelivr ou de qualquer serviço de terceiros usado na publicação.

## Escopo

Em escopo:

- `src/` — HTML, CSS e JavaScript do site/embed.
- `dist/` — artefatos gerados (`main.min.css`, `main.min.js`, `embed.html`, os 8 `embed-*.html`, `integrity.json`, `heights.json`).
- `tools/` — scripts de build, freeze, check, SRI e preview.
- Configuração de publicação: tag imutável, URLs do jsDelivr, atributos SRI e meta CSP.
- Links externos gerados pelo site (`wa.me`, demonstrações no Google Sites) e o tratamento de
  URLs em `safeUrl()`.

Fora de escopo:

- Vulnerabilidades na plataforma Google Sites, no jsDelivr, no GitHub ou em navegadores.
- Os 68 sites de demonstração hospedados no Google Sites (são conteúdo de terceiros/publicado
  fora deste repositório).
- Engenharia social, phishing ou ataques físicos.
- Disponibilidade e headers HTTP do domínio `sites.google.com` (não controlados por este projeto).

## Versões suportadas

| Versão | Suporte |
|---|---|
| `main` (última tag de release) | Sim |
| Tags de release anteriores | Não — atualize para a tag mais recente |
| Builds locais / `@main` no jsDelivr | Não |

O projeto é estático e não mantém múltiplas linhas de suporte. Correções são publicadas em uma nova
tag imutável e exigem re-colar os embeds no Google Sites.

## Como reportar uma vulnerabilidade

**Não abra uma issue pública** com detalhes exploráveis e **não publique dados sensíveis**.

Use um destes canais privados:

1. **GitHub Security Advisory (preferencial):**
   <https://github.com/MLCodeSolutions/Site_ML_Code_Solutions/security/advisories/new>
2. **Contato pelo perfil do mantenedor:**
   <https://github.com/MLCodeSolutions>

Inclua, se possível:

- descrição do problema e impacto;
- passos para reproduzir (URL, navegador, versão da tag);
- evidência (trecho de código, captura, resposta HTTP);
- sugestão de correção, se houver.

**Não há e-mail público de segurança.** Essa é uma decisão registrada no Gate 0: o
`.well-known/security.txt` é documental e não expõe endereço de e-mail. O retorno é feito pelo canal
privado usado no reporte.

### Expectativa de resposta

O projeto é mantido por uma pessoa. O objetivo é confirmar o recebimento em alguns dias úteis e
tratar o reporte conforme a gravidade. Não há SLA contratual nem recompensa financeira.

## Práticas de segurança adotadas

- **SRI (sha384)** em `main.min.css` e `main.min.js`, com `crossorigin="anonymous"`, conferido por
  `npm run sri` e registrado em `dist/integrity.json`.
- **Tag imutável no jsDelivr** (`@v1.0.0`, `@v1.0.1`, ...). Sem `@main` e sem
  `raw.githubusercontent.com` em produção — evita troca silenciosa de conteúdo.
- **CSP (Fase 3)** injetada como `meta` pelo build, sem `'unsafe-inline'`: `default-src 'none'`,
  scripts/styles/fontes/imagens apenas de `'self'` + jsDelivr, `object-src 'none'`,
  `base-uri 'none'`, `form-action 'none'`. A `meta` CSP depende de o Google Sites preservá-la; o
  spike de publicação ainda precisa confirmar (sem `frame-ancestors`, que não funciona em `meta`).
- **Embeds por seção sem chrome global:** os 8 `embed-*.html` contêm apenas o sprite de ícones, a
  seção correspondente e `<main id="conteudo">`; header, FAB, CTA mobile, banner de cookies e modal
  são removidos pelo build e barrados por `npm run check`.
- **Zero inline implementado:** `src/index.html` não tem `style=""`, handlers `onerror` nem scripts
  inline; `src/js` não usa `innerHTML`; `src/` e `tools/` não referenciam `raw.githubusercontent.com`
  nem `@main`. O build remove `<title>`, meta de SEO, OG/Twitter, canonical, favicon e JSON-LD do
  embed. Assets ficam em `assets/` (WebP-only nos prints); JPGs de captura em
  `tools/archive/prints-jpg/`, fora do deploy.
- **Dependências pinadas** (versões exatas em `package.json` + `package-lock.json`, instaladas com
  `npm ci`). Nenhuma dependência de runtime no site publicado.
- **`safeUrl()`** aceita somente `http:`/`https:` antes de usar URLs de dados; links externos usam
  `target="_blank"` com `rel="noopener noreferrer"`.
- **`waLink()`** monta o link do WhatsApp com `encodeURIComponent` na mensagem.
- **Modal acessível** com `inert`, foco restaurado e focus trap; skip link e `prefers-reduced-motion`.
- **Sem segredos no repositório.** Tokens/credenciais nunca são commitados; o build não precisa de
  token para gerar `dist/` (o repositório é público). Push exige credencial do mantenedor.
- **Repositório:** 2FA, branch protection em `main`, secret scanning/push protection e Dependabot
  habilitados manualmente. Ver a seção “Segurança manual” do `README.md`.

## Limitações conhecidas (Google Sites)

- A página publicada é servida pelo Google. **Não é possível controlar headers** como HSTS,
  `X-Frame-Options`, `X-Content-Type-Options` ou uma CSP de resposta real.
- Uma `meta` CSP dentro do iframe pode ser removida/ignorada pelo Google Sites. Se isso ocorrer,
  não há CSP efetiva no embed; restam SRI, zero inline, URLs fixas e sanitização de URLs.
- O embed precisa ser enquadrável (sem `frame-ancestors`/anti-framing), pois roda dentro do iframe
  do Sites.
- Analytics de terceiros (GA4/Meta) é desligado por padrão, não suporta SRI e, se ativado, amplia a
  superfície de CSP e de coleta de dados.
- O site de demonstração pode continuar exibindo a versão antiga até que os embeds sejam recolados
  e a página seja republicada no Sites.
