# Publicar no Google Sites

Checklist operacional para publicar o embed da ML Code Solutions no Google Sites usando o jsDelivr
com tag imutável.

> **Estado atual (2026-11-22):** Fases 0–5 concluídas. Assets em `assets/`, zero
> inline/`innerHTML`, URLs fixas, SRI + CSP (meta injetada pelo build) e os **8 embeds por seção**
> gerados em `dist/` (`embed-hero.html` … `embed-contato.html`). `npm run heights` grava
> `dist/heights.json` (390/768/1440) e imprime a tabela de alturas abaixo. `dist/embed.html`
> (embed único) continua sendo gerado para compatibilidade/contingência.

**Pré-requisitos**

- Node.js >= 20 e `npm ci` executado.
- Acesso de escrita ao repositório `MLCodeSolutions/Site_ML_Code_Solutions` (tag + push). Uma conta
  autenticada **sem permissão de escrita** recebe `403` no push, mesmo com credencial válida.
- Permissão de edição no Google Sites onde a página será publicada.
- Nenhum token/segredo no repositório. Se um token foi exposto, revogue antes do push.

---

## Checklist de publicação (11 passos)

### 1. Build de produção

Rode a validação e o build com a tag que será publicada:

```bash
npm ci
npm run build:release
npm run heights
npm run check
npm run freeze
npm run sri
```

- `build:release` usa por padrão a tag `v1.0.0` definida em `package.json`.
- Para outra versão, edite o script ou rode:
  `node tools/build.mjs --cdn=https://cdn.jsdelivr.net/gh/MLCodeSolutions/Site_ML_Code_Solutions@v1.0.1`
- Confirme que o build terminou com `build OK` e que nenhum budget foi excedido
  (embed < 80 KB; CSS gzip < 40 KB; JS gzip < 30 KB).
- O artefato para colar é um dos 8 `dist/embed-*.html` (recomendado) ou `dist/embed.html` (único).
  **Não edite `dist/` manualmente.**
- `npm run heights` mede as alturas reais e grava `dist/heights.json`; use a tabela da seção
  "Tabela de alturas" ao configurar cada iframe no Google Sites.

### 2. Commit

- Faça commit apenas do que é fonte/configuração: `src/`, `tools/`, `docs/`, `dist/`,
  `package.json`, `package-lock.json`, SVGs, assets.
- Nunca commite `node_modules/`, `index.backup-*.html`, planilhas locais, tokens ou segredos.
- Verifique com `git status` e `git diff --stat` antes de commitar.

### 3. Criar a tag `v1.0.0`

```bash
git tag -a v1.0.0 -m "release v1.0.0"
```

- A tag deve apontar para o commit exato que gerou o `dist/` publicado.
- **Tag é imutável.** Não mova, não apague e não reutilize uma tag já publicada.
- Para a próxima release, incremente (`v1.0.1`, `v1.1.0`, ...) e refaça o build com a nova tag.

### 4. Push

```bash
git push origin main
git push origin v1.0.0
```

- Nunca use force-push em `main`.
- Confirme no GitHub que o commit e a tag estão publicados.

### 5. Validar o jsDelivr

O jsDelivr pode levar alguns minutos para indexar a tag recém-criada (404 inicial é normal).

Valide os arquivos com a tag exata:

```text
https://cdn.jsdelivr.net/gh/MLCodeSolutions/Site_ML_Code_Solutions@v1.0.0/dist/main.min.css
https://cdn.jsdelivr.net/gh/MLCodeSolutions/Site_ML_Code_Solutions@v1.0.0/dist/main.min.js
https://cdn.jsdelivr.net/gh/MLCodeSolutions/Site_ML_Code_Solutions@v1.0.0/assets/svg/logo.svg
```

- Compare os hashes de `dist/integrity.json` com os arquivos servidos (o SRI usa os bytes
  decodificados do arquivo).
- A URL de asset acima já corresponde à fonte da Fase 3 (`assets/svg/`, `assets/img/prints/`,
  `assets/fonts/`); confirme que a tag publicada contém esses caminhos.
- Se algum arquivo der 404, aguarde e tente novamente; não publique com tag quebrada.
- Nunca valide/publique usando `@main` ou `raw.githubusercontent.com`.

### 5.1 Spike de CSP/SRI dentro do Google Sites

Cole **um** embed de teste (ex.: `dist/embed-hero.html`) e, no preview publicado, confira:

- **Elements**: o iframe contém `<meta http-equiv="Content-Security-Policy">`? Se o Sites tiver
  removido a meta, a CSP não vale no embed.
- **Console**: sem `Refused to load/execute/apply...`. Violações indicam CSP ativa bloqueando algo.
- **Network**: `main.min.css`/`main.min.js` retornam 200 pelo jsDelivr; se o SRI falhar, o console
  mostra erro de integridade e o JS não roda.
- **Altura**: o iframe mostra a seção inteira sem scroll interno (compare com `dist/heights.json`).

Se a meta CSP for removida pelo Sites, registre no `docs/QA-RELATORIO.md` e siga com as mitigações
restantes (SRI, zero inline, URLs fixas, `safeUrl`). Não tente compensar com headers: o domínio é do
Google.

### 6. Configurar o Google Sites

- Tema/cabeçalho o mais mínimo possível (evite header duplicado com o embed).
- Fundo da página: `#07030f`.
- Largura do conteúdo: total, para o embed ocupar a coluna.
- Menu nativo do Sites com os links das seções (o embed por seção não tem navegação global).
- Deixe o bloco de “Código incorporado” sem moldura/borda quando possível.

### 7. Inserir os embeds na ordem

No Google Sites: **Inserir → Incorporar → Código incorporado**, cole o HTML do arquivo
correspondente e ajuste a altura conforme a tabela de alturas mais abaixo.

Ordem recomendada dos 8 embeds (gerados pelo build):

| # | Arquivo | Conteúdo | Seção/IDs |
|---|---|---|---|
| 1 | `dist/embed-hero.html` | Hero + marquee + stats + trust | `#inicio` |
| 2 | `dist/embed-problema.html` | “O problema” | `#problema` |
| 3 | `dist/embed-servicos.html` | Serviços | `#servicos` |
| 4 | `dist/embed-processo.html` | Processo/timeline | `#processo` |
| 5 | `dist/embed-nichos-modelos.html` | Nichos + catálogo (68 modelos) | `#nichos`, `#modelos` |
| 6 | `dist/embed-planos.html` | Planos + pagamento | `#planos`, `#pagamento` |
| 7 | `dist/embed-sobre-faq.html` | Sobre + FAQ | `#sobre`, `#faq` |
| 8 | `dist/embed-contato.html` | Contato + legal + footer | `#contato`, `#legal` |

- Mantenha a ordem acima: ela preserva a narrativa e as âncoras internas do `embed-contato`.
- No modo seção, “Ver modelo” abre a demonstração direto em nova aba (sem modal).
- O modal de prévia completo existe apenas no embed único.
- `dist/embed.html` continua disponível como bloco único de contingência (ver aviso de rolagem
  dupla mais abaixo).

### 8. Texto nativo entre os blocos

O Google Sites ignora `title`, `meta description`, Open Graph e JSON-LD do embed. O SEO é nativo.
Insira no próprio Sites, fora dos iframes:

- `H1` e descrição curta no topo (ex.: “Sites profissionais por R$ 89,99, no ar em até 5 dias”).
- Um texto curto de serviço/preço antes ou entre os blocos, quando fizer sentido.
- Descrição da página nas configurações do site (usada pelo Google).
- Menu nativo apontando para as seções/âncoras publicadas.

Não duplique o mesmo `H1` no texto nativo e dentro do embed.

### 9. Nome, favicon, URL e imagem de compartilhamento

Nas configurações do Google Sites:

- **Nome do site:** ML Code Solutions.
- **Favicon:** ícone da marca (o embed não fornece favicon).
- **URL amigável:** URL final publicada (ex.: `.../ml-code-solutions-mlcs/mlcs`).
- **Imagem de compartilhamento:** `assets/img/og-1200x630.jpg` (1200×630).
- **Descrição do site:** texto curto com proposta e preço.
- Confirme que a URL final é a mesma usada em `CONFIG.siteUrl`.

### 10. Publicar e testar

- Publique com visibilidade **“Qualquer pessoa”**.
- Teste a URL publicada (não o preview do editor) em:
  - Chrome desktop;
  - Safari iOS (iPhone);
  - Chrome Android.
- Verifique: carregamento do CSS/JS do jsDelivr, fontes, SVGs, prints WebP, links de WhatsApp,
  abertura das demonstrações em nova aba, ausência de rolagem dupla e console sem erros de
  CSP/SRI/404.
- Teste com teclado, foco visível e `prefers-reduced-motion`.

### 11. Search Console e Perfil da Empresa

- Adicione a URL publicada ao **Google Search Console** e solicite indexação.
- Crie/atualize o **Perfil da Empresa no Google** (nome, categoria, área de atendimento, site,
  WhatsApp).
- Como o SEO do embed é ignorado, esses cadastros nativos são o principal canal de descoberta.
- Revalide após algumas semanas: indexação, consultas e eventuais erros.

---

## Tabela de alturas (medidas em 2026-11-22)

Alturas reais do conteúdo, sem scroll interno, medidas com `npm run heights` (Playwright + Edge,
`reducedMotion: "reduce"`, `document.fonts.ready`, prints lazy carregados) e gravadas em
`dist/heights.json`. Duas medições seguidas com diferença <= 2 px.

| Seção | 390 px | 768 px | 1440 px |
|---|---:|---:|---:|
| Hero (`embed-hero`) | 1427 | 1548 | 998 |
| Problema (`embed-problema`) | 1767 | 1081 | 1065 |
| Serviços (`embed-servicos`) | 2157 | 1409 | 1368 |
| Processo (`embed-processo`) | 1195 | 1046 | 1075 |
| Nichos + modelos (`embed-nichos-modelos`) | 2783 | 3535 | 3428 |
| Planos (`embed-planos`) | 2650 | 1914 | 1996 |
| Sobre + FAQ (`embed-sobre-faq`) | 2188 | 2027 | 2149 |
| Contato + legal (`embed-contato`) | 2224 | 1863 | 2040 |

Notas:

- Rode `npm run build` e `npm run heights` a cada release e cole a altura correspondente no bloco
  de incorporação do Google Sites. A altura muda se o CSS, a copy ou os prints mudarem.
- O Google Sites **não redimensiona** o iframe automaticamente. Escolha a coluna mais próxima da
  largura em que o bloco será exibido (mobile 390, tablet 768, desktop 1440).
- O `postMessage {type:"mlcs-height",section,h}` é apenas informativo; não altera o iframe sozinho.
- No modo seção, a altura deve ser a altura real do conteúdo (sem scroll interno).
- No embed único, a altura fica em torno de `100vh` e o scroll é interno ao iframe; não use a
  tabela acima para ele.

---

## Aviso: rolagem dupla no embed único

O embed único (`dist/embed.html`) mantém header estático, FAB do WhatsApp, barra mobile, “voltar ao
topo” e modal. Ele foi desenhado para rolar **dentro do iframe**. No Google Sites, o iframe tem
altura fixa e a página também rola — o resultado é **rolagem dupla** (barra da página + barra do
iframe), o que piora a experiência e o acesso por teclado.

Recomendação: **use os 8 embeds por seção** (formato recomendado). Se precisar do
embed único como contingência:

- defina uma altura generosa no bloco;
- teste em 390/768/1440;
- aceite a rolagem dupla e valide que nenhum elemento `fixed` escapa do iframe;
- não use o embed único em produção por prazo indeterminado.

---

## Fluxo de atualização por tag e repaste

Toda mudança de CSS/JS exige uma **nova tag** e o **repaste de todos os embeds**, porque todos
apontam para a mesma URL/versão com SRI.

1. Edite a fonte em `src/`.
2. Rode `npm run build:release` e `npm run heights`; depois `npm run check`, `npm run freeze` e
   `npm run sri`.
3. Crie a nova tag (ex.: `v1.0.1`) e ajuste o `--cdn` do build para ela.
4. Commit + push do commit e da tag.
5. Valide CSS/JS/assets no jsDelivr com a nova tag (passo 5 do checklist).
6. No Google Sites, **recole o HTML dos 8 `embed-*.html`** (e/ou do `embed.html`) para atualizar a
   tag, o SRI e o `data-base`; cole as novas alturas de `dist/heights.json` em cada bloco.
7. Republique e teste novamente Chrome/Safari iOS/Android.

Checklist rápido de release:

```text
[ ] npm ci
[ ] npm run check
[ ] npm run freeze
[ ] build com a nova tag
[ ] npm run heights
[ ] npm run sri
[ ] commit
[ ] git tag vX.Y.Z
[ ] push main + tag
[ ] jsDelivr OK (CSS/JS/assets)
[ ] repaste de todos os embeds no Sites
[ ] publicar e testar nos 3 navegadores
[ ] Search Console revalidado
```

> Se apenas a copy de uma seção mudar, o CSS/JS ainda é o mesmo recurso com SRI; a forma mais
> segura continua sendo recolocar os embeds com o HTML gerado para a nova tag. Nunca edite o HTML
> já colado no Sites para “corrigir na mão”.
